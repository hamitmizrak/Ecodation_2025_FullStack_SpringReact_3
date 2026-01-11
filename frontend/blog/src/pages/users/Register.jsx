// src/components/users/Register.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  initFromStorage,
  registerWithImageThunk,
  resetErrors,
  selectAuth,
} from '../../features/auth/authSlice';
import { Modal } from 'bootstrap';

function cleanupBootstrapModalArtifacts() {
  document.body.classList.remove('modal-open');
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
  document.querySelectorAll('.modal-backdrop').forEach((el) => el.remove());
}

export default function Register() {
  const dispatch = useDispatch();
  const { error, fieldErrors } = useSelector(selectAuth);

  const [f, setF] = useState({
    fullname: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false,
  });
  const [err, setErr] = useState({
    fullname: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: '',
    general: '',
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [pct, setPct] = useState(0);

  const invalid = useMemo(
    () => ({
      fullname: !!err.fullname,
      email: !!err.email,
      password: !!err.password,
      confirmPassword: !!err.confirmPassword,
      terms: !!err.terms,
    }),
    [err]
  );

  useEffect(() => {
    dispatch(initFromStorage());
    return () => dispatch(resetErrors());
  }, [dispatch]);

  useEffect(() => {
    if (error || fieldErrors) {
      setErr((s) => ({
        ...s,
        // fieldErrors mapping basit tutuyoruz (backend alan adlarını slice normalize ediyor)
        fullname: fieldErrors?.fullname || s.fullname,
        email: fieldErrors?.email || s.email,
        password: fieldErrors?.password || s.password,
        confirmPassword: fieldErrors?.confirmPassword || s.confirmPassword,
        terms: fieldErrors?.terms || s.terms,
        general: error || s.general,
      }));
    }
  }, [error, fieldErrors]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setF((s) => ({ ...s, [name]: type === 'checkbox' ? checked : value }));
    setErr((s) => ({ ...s, [name]: '', general: '' }));
  };
  const onFile = (e) => {
    const ff = e.target.files?.[0] || null;
    setFile(ff);
    setPreview(ff ? URL.createObjectURL(ff) : null);
    setPct(0);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const next = {
      fullname: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: '',
      general: '',
    };
    if (!f.fullname) next.fullname = 'Ad Soyad zorunlu';
    if (!f.email) next.email = 'Email zorunlu';
    if (!f.password) next.password = 'Şifre zorunlu';
    if (f.password && f.password.length < 6) next.password = 'En az 6 karakter';
    if (f.confirmPassword !== f.password) next.confirmPassword = 'Şifreler uyuşmuyor';
    if (!f.terms) next.terms = 'Koşulları kabul etmelisiniz';
    setErr(next);
    if (Object.values(next).some((v) => !!v)) return;

    const dto = {
      registerName: f.fullname,
      registerEmail: f.email,
      registerPassword: f.password,
      registerRePassword: f.confirmPassword,
    };

    try {
      await dispatch(
        registerWithImageThunk({
          rolesId: 1,
          values: dto,
          file,
          onProgress: (p) => setPct(p),
        })
      ).unwrap();

      // Register kapanınca Login aç
      const regEl = document.getElementById('registerId');
      if (regEl) {
        const regInst = Modal.getOrCreateInstance(regEl);
        regEl.addEventListener(
          'hidden.bs.modal',
          () => {
            cleanupBootstrapModalArtifacts();
            const loginEl = document.getElementById('loginId');
            if (loginEl) Modal.getOrCreateInstance(loginEl).show();
          },
          { once: true }
        );
        regInst.hide();
      } else {
        cleanupBootstrapModalArtifacts();
        const loginEl = document.getElementById('loginId');
        if (loginEl) Modal.getOrCreateInstance(loginEl).show();
      }

      // temizle
      setF({ fullname: '', email: '', password: '', confirmPassword: '', terms: false });
      setFile(null);
      setPreview(null);
      setPct(0);
      dispatch(resetErrors());
    } catch (e2) {
      setErr((s) => ({ ...s, general: e2?.message || s.general || 'Kayıt başarısız' }));
    }
  };

  return (
    <div className="container py-4">
      <h3>Kayıt Ol</h3>
      <form onSubmit={onSubmit} noValidate>
        <div className="mb-3">
          <label className="form-label">Ad Soyad</label>
          <input
            name="fullname"
            className={`form-control ${invalid.fullname ? 'is-invalid' : ''}`}
            value={f.fullname}
            onChange={onChange}
          />
          <div className="invalid-feedback">{err.fullname}</div>
        </div>

        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            name="email"
            type="email"
            className={`form-control ${invalid.email ? 'is-invalid' : ''}`}
            value={f.email}
            onChange={onChange}
          />
          <div className="invalid-feedback">{err.email}</div>
        </div>

        <div className="mb-3">
          <label className="form-label">Fotoğraf (opsiyonel)</label>
          <input type="file" accept="image/*" className="form-control" onChange={onFile} />
          {preview && (
            <img
              src={preview}
              alt="preview"
              style={{ maxWidth: 120, marginTop: 8, borderRadius: 8 }}
            />
          )}
          {pct > 0 && pct < 100 && (
            <div
              className="progress mt-2"
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin="0"
              aria-valuemax="100"
            >
              <div className="progress-bar" style={{ width: `${pct}%` }}>
                {pct}%
              </div>
            </div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">Şifre</label>
          <input
            name="password"
            type="password"
            className={`form-control ${invalid.password ? 'is-invalid' : ''}`}
            value={f.password}
            onChange={onChange}
          />
          <div className="invalid-feedback">{err.password}</div>
        </div>

        <div className="mb-3">
          <label className="form-label">Şifre Tekrar</label>
          <input
            name="confirmPassword"
            type="password"
            className={`form-control ${invalid.confirmPassword ? 'is-invalid' : ''}`}
            value={f.confirmPassword}
            onChange={onChange}
          />
          <div className="invalid-feedback">{err.confirmPassword}</div>
        </div>

        <div className="form-check mb-2">
          <input
            className={`form-check-input ${invalid.terms ? 'is-invalid' : ''}`}
            type="checkbox"
            id="terms"
            name="terms"
            checked={f.terms}
            onChange={onChange}
          />
          <label className="form-check-label" htmlFor="terms">
            Kullanım koşullarını kabul ediyorum
          </label>
          <div className="invalid-feedback">{err.terms}</div>
        </div>

        {err.general && <div className="text-danger small mb-2">{err.general}</div>}

        <button className="btn btn-primary">Kayıt Ol</button>
      </form>
    </div>
  );
}
