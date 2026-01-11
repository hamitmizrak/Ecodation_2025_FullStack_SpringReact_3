// IMPORT

import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { API_BASE, ENDPOINTS, IMAGE_BASE } from '../../config/api';
import { showSuccess, showError } from './resuability/toastHelper';
import { withTranslation } from 'react-i18next';

// ---------- Helpers ----------
// API cevabından data’yı çeşitli yapılar için çıkarır
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

  // DATA
  const [loading, setLoading] = useState(false);
  const [cats, setCats] = useState([]);
  const [items, setItems] = useState([]);

  // MODALS
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  // SELECTION + FORM
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    header: '',
    title: '',
    content: '',
    categoryId: '', //dropdown için
    image: '', //text URL
  });

  // ERRORS
  const [formError, setFormErrors] = useState({});

  // FILE (MULTIPART)
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');

  // SEARCH+FILTER+SORT+PAGE
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState('blogId'); // blogId|header|title|categoryName|systemCreatedDate
  const [sortDir, setSortDir] = useState('asc'); // asc|desc
  const [page, setPage] = useState(1); // Şu anki sayfa
  const [pageSize, setPageSize] = useState(10); // Sayfa başına 10 tane veri gelsin

  // MODAL'LARDAN BİRİ AÇIK MI?
  const anyOpen = showCreate || showEdit || showView || showDelete;

  // ------- EFFFECTS -------
  // Body'e modal-open class'ı ekle/çıkar (backdrop için)
  useEffect(() => {
    // Body'e modal-open class'ı ekle/çıkar (backdrop için)
    if (anyOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [anyOpen]);

  // ESCAPE İLE MODAL KAPATMA
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') return;
      if (showCreate) return closeCreate();
      if (showEdit) return closeEdit();
      if (showView) return closeView();
      if (showDelete) return closeDelete();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showCreate, showEdit, showView, showDelete]);

  // BLOGS,BLOGCATEGORY
  useEffect(() => {
    fetchBlogs();
    fetchCategories();
  }, []);

  // API ÇAĞRILARI
  // BLOG LIST
  const fetchBlogs = async () => {
    // Loading başlat
    setLoading(true);

    // API_BASE: http://localhost:4444
    // ENDPOINTS.BLOGS: /blog/api/v1.0.0/list
    try {
      const res = await axios.get(`${API_BASE}${ENDPOINTS.BLOGS}`);
      const data = extractData(res);
      const arr = Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : [];
    } catch (err) {
      showError?.('Blog Listesi Yüklenemedi') ?? console.error(err);
    } finally {
      // Liste geldiğinde Loading dursun
      setLoading(false);
    }
  };

  // BLOG CATEGORY LIST
  const fetchCategories = async () => {
    // Loading başlat
    setLoading(true);

    try {
      const res = await axios.get(`${API_BASE}${ENDPOINTS.BLOG_CATEGORY.LIST}`);
      const data = extractData(res);
      const arr = Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : [];
    } catch (err) {
      showError?.('Blog Kategori Listesi Yüklenemedi') ?? console.error(err);
    } finally {
      // Liste geldiğinde Loading dursun
      setLoading(false);
    }
  };

  /////////////////////////////////////////////////////////////////////////////////
  // RETURN
  return <div>Blog</div>;
}

export default withTranslation()(Blog);
