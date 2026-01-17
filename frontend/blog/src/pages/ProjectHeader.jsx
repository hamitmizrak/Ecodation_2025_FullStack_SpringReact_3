// src/components/ProjectHeader.jsx
// rfce
import React, { useEffect, useMemo, useState } from 'react';
import { Modal } from 'bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

// pictures
import TrFlag from '../shared/assets/images/flag/tr.png';
import EnFlag from '../shared/assets/images/flag/en.png';

// Redux (RTK)
import {
  initFromStorage,
  loginThunk,
  logout as logoutAction,
  resetErrors,
  registerWithImageThunk,
  selectAuth,
} from '../features/auth/authSlice';

/* -------------------- Modal temizliği yardımcıları -------------------- */
function cleanupBootstrapModalArtifacts() {
  document.body.classList.remove('modal-open');
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
  document.querySelectorAll('.modal-backdrop').forEach((el) => el.remove());
}
function showLoginModal() {
  const loginEl = document.getElementById('loginId');
  if (loginEl) Modal.getOrCreateInstance(loginEl).show();
}
/* --------------------------------------------------------------------- */

/* -------------------- Backend hata normalizer (formlar için) ---------- */
function pick(obj, ...keys) {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return undefined;
}
function normalizeBackendError(be) {
  if (!be) return { general: 'İşlem başarısız Mail Aktifleştirme', fields: {} };

  const general =
    pick(be, 'message', 'error', 'errorMessage', 'detail', 'description') ||
    pick(be?.data, 'message', 'error') ||
    pick(be?.result, 'message', 'error') ||
    'İşlem başarısız';

  const fields = {};
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
      if (v) fields[k] = Array.isArray(v) ? v[0] : String(v);
    }
  }

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
function mapRegisterFieldName(beField) {
  const map = {
    registerName: 'fullname',
    name: 'fullname',
    fullName: 'fullname',
    registerEmail: 'email',
    username: 'email',
    userName: 'email',
    mail: 'email',
    registerPassword: 'password',
    passwordHash: 'password',
    registerRePassword: 'confirmPassword',
    rePassword: 'confirmPassword',
    confirm_password: 'confirmPassword',
    terms: 'terms',
    roleId: 'roleId',
  };
  return map[beField] || beField;
}
function mapLoginFieldName(beField) {
  const map = {
    emailAddress: 'email',
    username: 'email',
    userName: 'email',
    mail: 'email',
    pwd: 'password',
  };
  return map[beField] || beField;
}
/* --------------------------------------------------------------------- */

/* ---- Sabit rol seçenekleri (1=Admin, 2=Writer, 3=User) ---- */
const ROLE_OPTIONS = [
  { id: 1, name: 'Admin' },
  { id: 2, name: 'Writer' },
  { id: 3, name: 'User' },
];

/* --------------------------------------------------------------------- */
/* --------------------------------------------------------------------- */
function ProjectHeader() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, error, fieldErrors } = useSelector(selectAuth);

  useEffect(() => {
    dispatch(initFromStorage());
  }, [dispatch]);

  /* -------------------- LOGIN FORM -------------------- */
  const [loginForm, setLoginForm] = useState({ email: '', password: '', remember: false });
  const [loginErr, setLoginErr] = useState({ email: '', password: '', general: '' });
  const loginInvalid = useMemo(
    () => ({ email: !!loginErr.email, password: !!loginErr.password }),
    [loginErr]
  );

  const onLoginChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoginForm((s) => ({ ...s, [name]: type === 'checkbox' ? checked : value }));
    setLoginErr((s) => ({ ...s, [name]: '', general: '' }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const errs = { email: '', password: '', general: '' };
    if (!loginForm.email) errs.email = 'E-posta zorunlu';
    if (!loginForm.password) errs.password = 'Şifre zorunlu';
    setLoginErr(errs);
    if (errs.email || errs.password) return;

    try {
      await dispatch(loginThunk({ email: loginForm.email, password: loginForm.password })).unwrap();

      // Başarı: modal kapat + artıkları temizle + yönlendir
      const modalEl = document.getElementById('loginId');
      if (modalEl) {
        try {
          Modal.getOrCreateInstance(modalEl).hide();
        } catch {}
      }
      cleanupBootstrapModalArtifacts();
      navigate('/admin', { replace: true });
    } catch (e2) {
      const be = e2?.response?.data;
      const { general, fields } = normalizeBackendError(be);
      const mapped = Object.fromEntries(
        Object.entries(fields).map(([k, v]) => [mapLoginFieldName(k), v])
      );
      setLoginErr({
        email: mapped.email || '',
        password: mapped.password || '',
        general:
          general === 'Bad credentials' || general === 'Unauthorized'
            ? 'Kullanıcı adı veya şifre hatalı'
            : general || e2?.message || 'Giriş başarısız',
      });
    }
  };

  /* -------------------- REGISTER FORM (RESİMLİ + SABİT ROLE ID) -------------------- */
  const [regForm, setRegForm] = useState({
    fullname: '',
    email: '',
    password: '',
    confirmPassword: '',
    roleId: '3', // Varsayılan: User (3)
    terms: false,
  });
  const [regErr, setRegErr] = useState({
    fullname: '',
    email: '',
    password: '',
    confirmPassword: '',
    roleId: '',
    terms: '',
    general: '',
  });
  const [regFile, setRegFile] = useState(null);
  const [regPreview, setRegPreview] = useState(null);
  const [uploadPct, setUploadPct] = useState(0);

  const regInvalid = useMemo(
    () => ({
      fullname: !!regErr.fullname,
      email: !!regErr.email,
      password: !!regErr.password,
      confirmPassword: !!regErr.confirmPassword,
      roleId: !!regErr.roleId,
      terms: !!regErr.terms,
    }),
    [regErr]
  );

  const onRegChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRegForm((s) => ({ ...s, [name]: type === 'checkbox' ? checked : value }));
    setRegErr((s) => ({ ...s, [name]: '', general: '' }));
  };
  const onRegFile = (e) => {
    const f = e.target.files?.[0] || null;
    setRegFile(f);
    setRegPreview(f ? URL.createObjectURL(f) : null);
    setUploadPct(0);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    const errs = {
      fullname: '',
      email: '',
      password: '',
      confirmPassword: '',
      roleId: '',
      terms: '',
      general: '',
    };
    if (!regForm.fullname) errs.fullname = 'Ad Soyad zorunlu';
    if (!regForm.email) errs.email = 'Email zorunlu';
    if (!regForm.password) errs.password = 'Şifre zorunlu';
    if (regForm.password && regForm.password.length < 6) errs.password = 'En az 6 karakter';
    if (regForm.confirmPassword !== regForm.password) errs.confirmPassword = 'Şifreler uyuşmuyor';
    if (!regForm.roleId || Number.isNaN(Number(regForm.roleId))) errs.roleId = 'Rol seçmelisiniz';
    if (!regForm.terms) errs.terms = 'Koşulları kabul etmelisiniz';
    setRegErr(errs);
    if (
      errs.fullname ||
      errs.email ||
      errs.password ||
      errs.confirmPassword ||
      errs.roleId ||
      errs.terms
    )
      return;

    const dto = {
      registerName: regForm.fullname,
      registerEmail: regForm.email,
      registerPassword: regForm.password,
      registerRePassword: regForm.confirmPassword,
    };

    const rolesId = Number(regForm.roleId); // 1:Admin, 2:Writer, 3:User

    try {
      await dispatch(
        registerWithImageThunk({
          rolesId, // PATH paramı olarak roleId
          values: dto,
          file: regFile,
          onProgress: (p) => setUploadPct(p),
        })
      ).unwrap();

      // Register kapanınca Login aç (backdrop temiz)
      const regEl = document.getElementById('registerId');
      if (regEl) {
        const regInst = Modal.getOrCreateInstance(regEl);
        regInst.hide();
      }
      cleanupBootstrapModalArtifacts();
      showLoginModal();

      // Temizle
      setRegForm({
        fullname: '',
        email: '',
        password: '',
        confirmPassword: '',
        roleId: '3',
        terms: false,
      });
      setRegFile(null);
      setRegPreview(null);
      setUploadPct(0);
      dispatch(resetErrors());
    } catch (e2) {
      const be = e2?.response?.data;
      const { general, fields } = normalizeBackendError(be);
      const mapped = Object.fromEntries(
        Object.entries(fields).map(([k, v]) => [mapRegisterFieldName(k), v])
      );
      setRegErr((s) => ({
        ...s,
        fullname: mapped.fullname || s.fullname,
        email: mapped.email || s.email,
        password: mapped.password || s.password,
        confirmPassword: mapped.confirmPassword || s.confirmPassword,
        roleId: mapped.roleId || s.roleId,
        terms: mapped.terms || s.terms,
        general: general || 'Kayıt başarısız',
      }));
    }
  };

  /* -------------------- Redux error -> form alanlarına dağıt -------------------- */
  useEffect(() => {
    if (!error && !fieldErrors) return;

    // Login alanları
    const loginMap = {};
    if (fieldErrors) {
      for (const [k, v] of Object.entries(fieldErrors)) {
        const kk = mapLoginFieldName(k);
        if (kk === 'email' || kk === 'password') loginMap[kk] = Array.isArray(v) ? v[0] : String(v);
      }
    }
    setLoginErr((s) => ({
      email: loginMap.email || s.email,
      password: loginMap.password || s.password,
      general: error || s.general,
    }));

    // Register alanları
    const regMap = {};
    if (fieldErrors) {
      for (const [k, v] of Object.entries(fieldErrors)) {
        const kk = mapRegisterFieldName(k);
        if (['fullname', 'email', 'password', 'confirmPassword', 'roleId', 'terms'].includes(kk)) {
          regMap[kk] = Array.isArray(v) ? v[0] : String(v);
        }
      }
    }
    setRegErr((s) => ({
      fullname: regMap.fullname || s.fullname,
      email: regMap.email || s.email,
      password: regMap.password || s.password,
      confirmPassword: regMap.confirmPassword || s.confirmPassword,
      roleId: regMap.roleId || s.roleId,
      terms: regMap.terms || s.terms,
      general: error || s.general,
    }));
  }, [error, fieldErrors]);

  /* -------------------- UI (koşullu linkler) -------------------- */
  const authLinks = (
    <>
      <li className="nav-item">
        <Link id="adminLink" className="nav-link" to="/admin">
          <i className="fa fa-user-shield" /> Admin Paneli
        </Link>
      </li>
      <li className="nav-item">
        <a
          id="logoutLink"
          className="nav-link"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            dispatch(logoutAction());
            cleanupBootstrapModalArtifacts();
          }}
        >
          <i className="fa fa-sign-out-alt" /> Çıkış
        </a>
      </li>
    </>
  );

  const guestLinks = (
    <>
      <li className="nav-item me-3">
        <a
          href="#"
          className="nav-link text-white small"
          data-bs-toggle="modal"
          data-bs-target="#registerId"
          onClick={() => dispatch(resetErrors())}
        >
          <i className="fa-solid fa-address-card text-danger me-1" /> Register
        </a>
      </li>
      <li className="nav-item">
        <a
          href="#"
          className="nav-link text-white small"
          data-bs-toggle="modal"
          data-bs-target="#loginId"
          onClick={() => dispatch(resetErrors())}
        >
          <i className="fa-solid fa-user-secret text-primary me-1" /> Login
        </a>
      </li>
    </>
  );

  return (
    <React.Fragment>
      <>
        {/* backtotop */}
        <span id="back_top_span" />

        {/* NAVBAR FIRST */}
        <nav
          id="navbar_first"
          className="navbar navbar-expand wow44 animate__animated animate__fadeInDown"
          data-wow-delay="0.2s"
        >
          <div className="container">
            <div className="d-flex justify-content-between w-100">
              <ul className="nav">
                {isAuthenticated ? authLinks : guestLinks}
                <li className="nav-item">
                  <a href="#" className="nav-link text-white small">
                    <span>
                      <img className="flag" src={TrFlag} alt="TR" />
                    </span>
                  </a>
                </li>
                <li className="nav-item">
                  <a href="#" className="nav-link text-white small">
                    <span>
                      <img className="flag" src={EnFlag} alt="EN" />
                    </span>
                  </a>
                </li>
              </ul>
              <ul className="nav">
                <li className="nav-item">
                  <a href="#" className="nav-link text-white" aria-label="LinkedIn">
                    <i className="fa-brands fa-linkedin" />
                  </a>
                </li>
                <li className="nav-item">
                  <a href="#" className="nav-link text-white" aria-label="GitHub">
                    <i className="fa-brands fa-github" />
                  </a>
                </li>
                <li className="nav-item">
                  <a href="#" className="nav-link text-white" aria-label="Facebook">
                    <i className="fa-brands fa-facebook" />
                  </a>
                </li>
                <li className="nav-item">
                  <a href="#" className="nav-link text-white" aria-label="Instagram">
                    <i className="fa-brands fa-instagram text-warning" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {/* REGISTER MODAL (resimli + roleId: 1/2/3) */}
        <div
          className="modal fade"
          id="registerId"
          tabIndex={-1}
          data-bs-backdrop="static"
          data-bs-keyboard="false"
          aria-labelledby="registerModalLabel"
          aria-hidden="true"
        >
          <div
            className="modal-dialog modal-dialog-scrollable modal-dialog-centered modal-md"
            role="document"
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="registerModalLabel">
                  Kayıt Ol
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                />
              </div>
              <div className="modal-body">
                <form id="registerForm" noValidate onSubmit={handleRegisterSubmit}>
                  <div className="mb-3">
                    <label htmlFor="fullname" className="form-label">
                      Ad Soyad
                    </label>
                    <input
                      type="text"
                      className={`form-control ${regInvalid.fullname ? 'is-invalid' : ''}`}
                      id="fullname"
                      name="fullname"
                      value={regForm.fullname}
                      onChange={onRegChange}
                      placeholder="Adınızı ve soyadınızı girin"
                    />
                    <div className="invalid-feedback">{regErr.fullname}</div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email
                    </label>
                    <input
                      type="email"
                      className={`form-control ${regInvalid.email ? 'is-invalid' : ''}`}
                      id="email"
                      name="email"
                      value={regForm.email}
                      onChange={onRegChange}
                      placeholder="ornek@mail.com"
                    />
                    <div className="invalid-feedback">{regErr.email}</div>
                  </div>

                  {/* Rol seçimi (1=Admin, 2=Writer, 3=User) */}
                  <div className="mb-3">
                    <label htmlFor="roleId" className="form-label">
                      Rol (ID)
                    </label>
                    <select
                      id="roleId"
                      name="roleId"
                      className={`form-select ${regInvalid.roleId ? 'is-invalid' : ''}`}
                      value={regForm.roleId}
                      onChange={onRegChange}
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.id}: {r.name}
                        </option>
                      ))}
                    </select>
                    <div className="invalid-feedback">{regErr.roleId}</div>
                    <div className="form-text">
                      Seçiminiz backend’e <code>/create/{'{rolesId}'}</code> parametresi olarak
                      gönderilir.
                    </div>
                  </div>

                  {/* Fotoğraf (opsiyonel) */}
                  <div className="mb-3">
                    <label htmlFor="avatar" className="form-label">
                      Fotoğraf (opsiyonel)
                    </label>
                    <input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      className="form-control"
                      onChange={onRegFile}
                    />
                    {regPreview && (
                      <img
                        src={regPreview}
                        alt="preview"
                        style={{ maxWidth: 120, marginTop: 8, borderRadius: 8 }}
                      />
                    )}
                    {uploadPct > 0 && uploadPct < 100 && (
                      <div
                        className="progress mt-2"
                        role="progressbar"
                        aria-valuenow={uploadPct}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      >
                        <div className="progress-bar" style={{ width: `${uploadPct}%` }}>
                          {uploadPct}%
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Şifre
                    </label>
                    <input
                      type="password"
                      className={`form-control ${regInvalid.password ? 'is-invalid' : ''}`}
                      id="password"
                      name="password"
                      value={regForm.password}
                      onChange={onRegChange}
                      placeholder="Şifrenizi girin"
                    />
                    <div className="invalid-feedback">{regErr.password}</div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label">
                      Şifre Tekrar
                    </label>
                    <input
                      type="password"
                      className={`form-control ${regInvalid.confirmPassword ? 'is-invalid' : ''}`}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={regForm.confirmPassword}
                      onChange={onRegChange}
                      placeholder="Şifrenizi tekrar girin"
                    />
                    <div className="invalid-feedback">{regErr.confirmPassword}</div>
                  </div>

                  <div className="form-check mb-2">
                    <input
                      className={`form-check-input ${regInvalid.terms ? 'is-invalid' : ''}`}
                      type="checkbox"
                      id="terms"
                      name="terms"
                      checked={regForm.terms}
                      onChange={onRegChange}
                    />
                    <label className="form-check-label" htmlFor="terms">
                      Kullanım koşullarını kabul ediyorum
                    </label>
                    <div className="invalid-feedback">{regErr.terms}</div>
                  </div>

                  {regErr.general && <div className="text-danger small">{regErr.general}</div>}
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                  Kapat
                </button>
                <button type="submit" form="registerForm" className="btn btn-primary">
                  Kayıt Ol
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* LOGIN MODAL */}
        <div
          className="modal fade"
          id="loginId"
          tabIndex={-1}
          data-bs-backdrop="static"
          data-bs-keyboard="false"
          aria-labelledby="loginModalLabel"
          aria-hidden="true"
        >
          <div
            className="modal-dialog modal-dialog-scrollable modal-dialog-centered modal-md"
            role="document"
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="loginModalLabel">
                  Giriş Yap
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                />
              </div>
              <div className="modal-body">
                <form id="loginForm" noValidate onSubmit={handleLoginSubmit}>
                  <div className="mb-3">
                    <label htmlFor="loginEmail" className="form-label">
                      Email
                    </label>
                    <input
                      type="email"
                      className={`form-control ${loginInvalid.email ? 'is-invalid' : ''}`}
                      id="loginEmail"
                      name="email"
                      value={loginForm.email}
                      onChange={onLoginChange}
                      placeholder="ornek@mail.com"
                      required
                    />
                    <div className="invalid-feedback">{loginErr.email}</div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="loginPassword" className="form-label">
                      Şifre
                    </label>
                    <input
                      type="password"
                      className={`form-control ${loginInvalid.password ? 'is-invalid' : ''}`}
                      id="loginPassword"
                      name="password"
                      value={loginForm.password}
                      onChange={onLoginChange}
                      placeholder="Şifrenizi girin"
                      required
                    />
                    <div className="invalid-feedback">{loginErr.password}</div>
                  </div>
                  <div className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="rememberMe"
                      name="remember"
                      checked={loginForm.remember}
                      onChange={onLoginChange}
                    />
                    <label className="form-check-label" htmlFor="rememberMe">
                      Beni hatırla
                    </label>
                  </div>
                  {loginErr.general && <div className="text-danger small">{loginErr.general}</div>}
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                  Kapat
                </button>
                <button type="submit" form="loginForm" className="btn btn-primary">
                  Giriş Yap
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* NAVBAR SECOND */}
        <nav
          id="navbar_second"
          className="navbar navbar-expand-md navbar-dark wow44 animate__animated animate__fadeInDown"
          data-wow-delay="0.4s"
        >
          <div className="container">
            <a className="navbar-brand" href="/">
              <img id="logo_id" src={TrFlag} alt="Logo" />
            </a>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarMenu"
              aria-controls="navbarMenu"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon" />
            </button>
            <div className="collapse navbar-collapse" id="navbarMenu">
              <ul className="navbar-nav me-auto">
                <li className="nav-item">
                  <a className="nav-link active" href="/">
                    <i className="fa-solid fa-house" /> Anasayfa
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#scroll_spy_works">
                    <i className="fa-solid fa-briefcase" /> Çalışmalar
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#scroll_spy_success_rate">
                    <i className="fa-solid fa-chart-column" /> Başarılar
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#scroll_spy_newspaper">
                    <i className="fa-solid fa-newspaper" /> Haberler
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#scroll_spy_about">
                    <i className="fa-solid fa-bullhorn" /> Hakkımızda
                  </a>
                </li>
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#scroll_spy_blog"
                    id="dropdownId"
                    data-bs-toggle="dropdown"
                  >
                    <i className="fa-solid fa-blog" /> Blog
                  </a>
                  <div className="dropdown-menu">
                    <a className="dropdown-item" href="#scroll_spy_blog">
                      Yazılım
                    </a>
                    <a className="dropdown-item" href="#scroll_spy_blog">
                      Sağlık
                    </a>
                    <a className="dropdown-item" href="#scroll_spy_blog">
                      Yaşam
                    </a>
                    <a className="dropdown-item" href="#scroll_spy_blog">
                      Spor
                    </a>
                  </div>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#maps">
                    <i className="fa-solid fa-map-location-dot" /> İletişim
                  </a>
                </li>
              </ul>
              {/* Sağ: Dark Mode + Arama */}
              <div className="nav-actions">
                <button id="dark_mode" className="dark-mode-btn">
                  <i className="fa-solid fa-moon" />
                </button>
                <form className="search-form">
                  <div className="search-container">
                    <input
                      id="search_id"
                      type="text"
                      className="form-control"
                      placeholder="Site içi ara..."
                    />
                    <button className="search-button" type="submit">
                      Ara
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </nav>

        {/* HEADER */}
        <header id="header_id">
          <div className="header-overlay img-glare" />
          <div className="container h-100">
            <div className="row h-100">
              <div className="col-12 text-center my-auto">
                <h1
                  className="display-3 text-uppercase shadow wow animate__zoomIn"
                  data-wow-delay="0.6s"
                >
                  Full Stack Developer Eğitimine Hoşgeldiniz
                </h1>
                <h4 className="wow animate__zoomIn" data-wow-delay="0.8s">
                  Frontend &amp; Backend &amp; DB &amp; Devops
                </h4>
                <div className="header-links mt-4">
                  <a
                    href="https://www.linkedin.com"
                    target="_blank"
                    className="header-link wow animate__fadeInUp"
                    data-wow-delay="0.9s"
                    rel="noreferrer"
                  >
                    <i className="fa-brands fa-linkedin" />
                    <span />
                  </a>
                  <a
                    href="https://www.youtube.com"
                    target="_blank"
                    className="header-link wow animate__fadeInUp"
                    data-wow-delay="1s"
                    rel="noreferrer"
                  >
                    <i className="fa-brands fa-youtube" />
                    <span />
                  </a>
                  <a
                    href="#blog"
                    className="header-link wow animate__fadeInUp"
                    data-wow-delay="1.1s"
                  >
                    <i className="fa-solid fa-blog" />
                    <span />
                  </a>
                  <a
                    href="https://github.com"
                    target="_blank"
                    className="header-link wow animate__fadeInUp"
                    data-wow-delay="1.2s"
                    rel="noreferrer"
                  >
                    <i className="fa-brands fa-github" />
                    <span />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Sosyal Medya Sabit Bar */}
        <div className="social-bar-fixed text-primary">
          <a
            href="https://linkedin.com/"
            target="_blank"
            className="social-link linkedin"
            title="LinkedIn"
            rel="noreferrer"
          >
            <i className="fab fa-linkedin-in" />
          </a>
          <a
            href="https://github.com/"
            target="_blank"
            className="social-link github"
            title="GitHub"
            rel="noreferrer"
          >
            <i className="fab fa-github" />
          </a>
          <a
            href="https://instagram.com/"
            target="_blank"
            className="social-link instagram"
            title="Instagram"
            rel="noreferrer"
          >
            <i className="fab fa-instagram" />
          </a>
          <a
            href="mailto:info@aihexa.com"
            target="_blank"
            className="social-link mail"
            title="Mail"
            rel="noreferrer"
          >
            <i className="fa fa-envelope" />
          </a>
        </div>
      </>
    </React.Fragment>
  );
}

export default ProjectHeader;
