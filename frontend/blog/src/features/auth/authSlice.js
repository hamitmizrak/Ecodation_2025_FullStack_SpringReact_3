// src/features/auth/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';

import { axiosClient, setAccessToken, clearAccessToken } from '../../lib/axiosClient';
import { ENDPOINTS } from '../../config/api';
import { fetchMe } from './authService';
import { createRegisterWithImage } from '../register/registerService';

/* =========================== Helpers =========================== */

function isExpired(token) {
  try {
    const { exp } = jwtDecode(token);
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
}

function safeDecode(token) {
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
}

/** Backend login cevabından token’ı sağlam çek */
function extractToken(res) {
  const d = res?.data ?? {};
  let token = d.accessToken || d.token || d.jwt || d.jwtToken || d.id_token;

  if (!token && d.data) token = d.data.accessToken || d.data.token || d.data.jwt;
  if (!token && d.result) token = d.result.accessToken || d.result.token || d.result.jwt;

  const h = res?.headers || {};
  const authHeader = h.authorization || h.Authorization;
  const headerBearer =
    typeof authHeader === 'string' && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const headerX = h['x-access-token'] || h['X-Access-Token'];

  return token || headerBearer || headerX || null;
}

/** JWT claim’lerinden maksimum kapsama ile rol çıkar */
function extractRolesFromToken(token) {
  try {
    const p = jwtDecode(token) || {};
    let out = [];

    const pushArr = (arr) => Array.isArray(arr) && out.push(...arr.map(String));
    const pushAuthObjs = (arr) =>
      Array.isArray(arr) &&
      out.push(...arr.map((x) => (typeof x === 'string' ? x : x?.authority)).filter(Boolean));

    pushArr(p.roles);
    pushArr(p.scopes);
    pushArr(p.scp);
    if (typeof p.scope === 'string') pushArr(p.scope.split(/\s+/));

    pushArr(p.authorities);
    pushAuthObjs(p.authorities);

    if (p.realm_access?.roles) pushArr(p.realm_access.roles);
    if (p.resource_access) {
      Object.values(p.resource_access).forEach((v) => v?.roles && pushArr(v.roles));
    }

    // Normalize (BÜYÜK + ROLE_ kırp)
    out = out.map((r) => String(r).toUpperCase().trim()).map((r) => r.replace(/^ROLE_/, ''));

    return [...new Set(out)];
  } catch {
    return [];
  }
}

/** /me cevabından rol çıkar (çeşitli şemaları destekler) */
function extractRolesFromMeResponse(res) {
  const d = res?.data ?? res ?? {};
  let roles =
    d.roles || d.authorities || d.user?.roles || d.data?.roles || d.data?.authorities || [];

  if (Array.isArray(roles) && roles.length && typeof roles[0] === 'object') {
    roles = roles.map((x) => x?.authority || x?.name).filter(Boolean);
  }

  roles = (roles || [])
    .map((r) => String(r).toUpperCase().trim())
    .map((r) => r.replace(/^ROLE_/, ''));

  return [...new Set(roles)];
}

/** Hata gövdelerini normalize et → { general, fields } */
function pick(obj, ...keys) {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return undefined;
}
function normalizeBackendError(be) {
  if (!be) return { general: 'İşlem başarısız', fields: {} };

  const general =
    pick(be, 'message', 'error', 'errorMessage', 'detail', 'description') ||
    pick(be?.data, 'message', 'error') ||
    pick(be?.result, 'message', 'error') ||
    'İşlem başarısız';

  const fields = {};

  // Map-like
  const mapLike =
    be?.fieldErrors && typeof be.fieldErrors === 'object' && !Array.isArray(be.fieldErrors)
      ? be.fieldErrors
      : be?.errors && typeof be.errors === 'object' && !Array.isArray(be.errors)
      ? be.errors
      : be?.data?.fieldErrors && typeof be.data.fieldErrors === 'object'
      ? be.data.fieldErrors
      : be?.result?.fieldErrors && typeof be.result.fieldErrors === 'object'
      ? be.result.fieldErrors
      : null;

  if (mapLike) {
    for (const [k, v] of Object.entries(mapLike)) {
      if (v !== undefined && v !== null && v !== '') {
        fields[k] = Array.isArray(v) ? v[0] : String(v);
      }
    }
  }

  // Array-like
  const arrayLike =
    (Array.isArray(be?.fieldErrors) && be.fieldErrors) ||
    (Array.isArray(be?.errors) && be.errors) ||
    (Array.isArray(be?.validationErrors) && be.validationErrors) ||
    (Array.isArray(be?.violations) && be.violations) ||
    (Array.isArray(be?.data?.errors) && be.data.errors) ||
    (Array.isArray(be?.result?.errors) && be.result.errors) ||
    null;

  if (arrayLike) {
    arrayLike.forEach((it) => {
      const key = it?.field || it?.name || it?.propertyPath || it?.path || it?.param || it?.code;
      const msg =
        it?.message || it?.defaultMessage || it?.errorMessage || it?.reason || it?.description;
      if (key && msg) fields[key] = msg;
    });
  }

  return { general, fields };
}

/* =========================== Thunks =========================== */

/** Uygulama açılışında localStorage’tan auth state’i yükle */
export const initFromStorage = createAsyncThunk('auth/initFromStorage', async () => {
  const token = localStorage.getItem('token');
  let roles = [];

  if (token && !isExpired(token)) {
    setAccessToken(token);

    // Storage’taki roller
    const rStr = localStorage.getItem('roles');
    if (rStr) {
      try {
        roles = JSON.parse(rStr) || [];
      } catch {
        roles = [];
      }
    }

    // Hâlâ boşsa token decode et
    if (!roles.length) roles = extractRolesFromToken(token);

    // Hâlâ boşsa /me çağır (varsa)
    if (!roles.length) {
      try {
        const meRes = await fetchMe();
        roles = extractRolesFromMeResponse(meRes);
        if (roles.length) localStorage.setItem('roles', JSON.stringify(roles));
      } catch {
        // /me yoksa sorun değil
      }
    }

    return {
      token,
      roles,
      isAuthenticated: true,
    };
  }

  // Token yok/expired → temizle
  localStorage.removeItem('token');
  localStorage.removeItem('roles');
  clearAccessToken();
  return { token: null, roles: [], isAuthenticated: false };
});

/** Login */
export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await axiosClient.post(ENDPOINTS.LOGIN, { email, password });
      const token = extractToken(res);
      if (!token) return rejectWithValue({ message: 'Token bulunamadı' });

      //Eğer token varsa bunu set etsin
      setAccessToken(token);

      // Roller: önce token’dan
      let roles = extractRolesFromToken(token);

      // Yine yoksa /me
      if (!roles.length) {
        try {
          const meRes = await fetchMe();
          roles = extractRolesFromMeResponse(meRes);
        } catch {
          // /me yoksa sorun değil
        }
      }

      // Persist
      localStorage.setItem('token', token);
      localStorage.setItem('roles', JSON.stringify(roles || []));

      return { token, roles };
    } catch (e) {
      return rejectWithValue(e?.response?.data || { message: e.message });
    }
  }
);

/** Resimli Register */
export const registerWithImageThunk = createAsyncThunk(
  'auth/registerWithImage',
  async ({ rolesId = 1, values, file, onProgress }, { rejectWithValue }) => {
    try {
      const res = await createRegisterWithImage(rolesId, values, file, onProgress);
      return res?.data ?? res;
    } catch (e) {
      return rejectWithValue(e?.response?.data || { message: e.message });
    }
  }
);

/** İsteğe bağlı: /me (profil tazeleme) */
export const meThunk = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const out = await fetchMe();
    return out?.data ?? out;
  } catch (e) {
    return rejectWithValue(e?.response?.data || { message: e.message });
  }
});

/* =========================== Slice =========================== */

const initialState = {
  token: null,
  roles: [],
  isAuthenticated: false,

  loading: false,
  error: null,
  fieldErrors: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.roles = [];
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.fieldErrors = null;

      // Logout sonrasında token silmek istemezsek bunu kaldırabilirsiniz
      //localStorage.removeItem('token');
      //localStorage.removeItem('roles');
      clearAccessToken();
    },
    resetErrors(state) {
      state.error = null;
      state.fieldErrors = null;
    },
  },
  extraReducers: (b) => {
    // init
    b.addCase(initFromStorage.pending, (s) => {
      s.loading = true;
    });
    b.addCase(initFromStorage.fulfilled, (s, a) => {
      s.loading = false;
      s.token = a.payload.token;
      s.roles = a.payload.roles || [];
      s.isAuthenticated = a.payload.isAuthenticated;
      s.error = null;
      s.fieldErrors = null;
    });
    b.addCase(initFromStorage.rejected, (s) => {
      s.loading = false;
    });

    // login
    b.addCase(loginThunk.pending, (s) => {
      s.loading = true;
      s.error = null;
      s.fieldErrors = null;
    });
    b.addCase(loginThunk.fulfilled, (s, a) => {
      s.loading = false;
      s.token = a.payload.token;
      s.roles = a.payload.roles || [];
      s.isAuthenticated = true;
    });
    b.addCase(loginThunk.rejected, (s, a) => {
      s.loading = false;
      const { general, fields } = normalizeBackendError(a.payload);
      s.error = general || 'Giriş başarısız';
      s.fieldErrors = fields || null;
    });

    // register (resimli)
    b.addCase(registerWithImageThunk.pending, (s) => {
      s.loading = true;
      s.error = null;
      s.fieldErrors = null;
    });
    b.addCase(registerWithImageThunk.fulfilled, (s) => {
      s.loading = false;
    });
    b.addCase(registerWithImageThunk.rejected, (s, a) => {
      s.loading = false;
      const { general, fields } = normalizeBackendError(a.payload);
      s.error = general || 'Kayıt başarısız';
      s.fieldErrors = fields || null;
    });

    // me (opsiyonel)
    b.addCase(meThunk.fulfilled, (s, a) => {
      // İstersen burada user profilini store’a ekleyebilirsin.
      // Roller zaten token/storage’dan geliyor, gerekirse me’den de güncelleyebilirsin.
      const meRoles = extractRolesFromMeResponse(a.payload);
      if (meRoles.length) {
        s.roles = meRoles;
        localStorage.setItem('roles', JSON.stringify(meRoles));
      }
    });
  },
});

export const { logout, resetErrors } = authSlice.actions;

export const selectAuth = (state) => state.auth;
export const selectHasAnyRole = (roles) => (state) => {
  const have = (state.auth.roles || []).map((r) => String(r).toUpperCase());
  const need = (roles || []).map((r) => String(r).toUpperCase());
  return have.some((r) => need.includes(r));
};

export default authSlice.reducer;
