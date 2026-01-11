// src/components/users/Login.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  initFromStorage,
  loginThunk,
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

export default function Login() {
  const dispatch = useDispatch();
  const { isAuthenticated, error, fieldErrors } = useSelector(selectAuth);

  const [f, setF] = useState({ email: '', password: '' });
  const [err, setErr] = useState({ email: '', password: '', general: '' });
  const invalid = useMemo(() => ({ email: !!err.email, password: !!err.password }), [err]);

  useEffect(() => {
    dispatch(initFromStorage());
    return () => dispatch(resetErrors());
  }, [dispatch]);

  useEffect(() => {
    if (error || fieldErrors) {
      setErr((s) => ({
        email: fieldErrors?.email || s.email,
        password: fieldErrors?.password || s.password,
        general: error || s.general,
      }));
    }
  }, [error, fieldErrors]);

  useEffect(() => {
    if (isAuthenticated) {
      // modal ise kapat
      const modalEl = document.getElementById('loginId');
      if (modalEl) {
        const inst = Modal.getOrCreateInstance(modalEl);
        modalEl.addEventListener(
          'hidden.bs.modal',
          () => {
            cleanupBootstrapModalArtifacts();
            window.location.href = '/admin/blog-category';
          },
          { once: true }
        );
        inst.hide();
      } else {
        window.location.href = '/admin/blog-category';
      }
    }
  }, [isAuthenticated]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setF((s) => ({ ...s, [name]: value }));
    setErr((s) => ({ ...s, [name]: '', general: '' }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const next = { email: '', password: '', general: '' };
    if (!f.email) next.email = 'E-posta zorunlu';
    if (!f.password) next.password = 'Şifre zorunlu';
    setErr(next);
    if (next.email || next.password) return;

    try {
      await dispatch(loginThunk({ email: f.email, password: f.password })).unwrap();
    } catch (e2) {
      setErr((s) => ({
        ...s,
        general:
          e2?.message === 'Bad credentials' || e2?.message === 'Unauthorized'
            ? 'Kullanıcı adı veya şifre hatalı'
            : e2?.message || s.general || 'Giriş başarısız',
      }));
    }
  };

  return (
    <div className="container py-4">
      <h3>Giriş Yap</h3>
      <form onSubmit={onSubmit} noValidate>
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
        {err.general && <div className="text-danger small mb-2">{err.general}</div>}
        <button className="btn btn-primary">Giriş Yap</button>
      </form>
    </div>
  );
}
