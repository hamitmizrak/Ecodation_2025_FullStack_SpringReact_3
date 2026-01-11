// IMPORT

import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { API_BASE, ENDPOINTS, IMAGE_BASE } from '../../config/api';
import { showSuccess, showError } from './resuability/toastHelper';
import { withTranslation } from 'react-i18next';

// ---------- Helpers ----------
const extractData = (res) => {
  const d = res?.data;
  return d?.data ?? d?.result ?? d?.items ?? d?.content ?? d ?? [];
};

// ISO tarih formatını yerel tarih-saat formatına çevirir
const fmtDate = (iso) =>
  !iso ? '' : new Date(iso).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });

// Resim URL'sini tam hale getirir (mutlak URL veya IMAGE_BASE ile)
const resolveImageUrl = (src) =>
  !src
    ? ''
    : /^https?:\/\//i.test(src)
    ? src
    : `${IMAGE_BASE}${src.startsWith('/') ? src : '/' + src}`;

// Basit global backdrop (modal arka planı)
function GlobalBackdrop({ show, onClose }) {
  if (!show) return null;
  return (
    <div
      className="modal-backdrop fade show"
      style={{ zIndex: 1040 }}
      onClick={onClose || undefined}
    />
  );
}

// ---------- Blog Component ----------
// rfce

function Blog() {
  // STATE

  //DATA
  const [loading, setLoading] = useState(false);
  const [cats, setCats] = useState([]);
  const [items, setItems] = useState([]);

  // MODALS
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  // SELECTION + FORM

  // RETURN
  return <div>Blog</div>;
}

export default withTranslation()(Blog);
