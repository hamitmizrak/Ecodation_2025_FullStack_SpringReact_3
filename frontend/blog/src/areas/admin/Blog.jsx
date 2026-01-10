// Blog.jsx — FINAL (octet-stream hatası çözülmüş sürüm)
// Özellikler: Arama | Sıralama | Sayfalama | Modal (ESC/backdrop) | Dosya önizleme/silme | Toast bildirimleri
// ÖNEMLİ: Multipart gönderimde header set ETME — tarayıcı boundary'i eklesin.
//         @RequestPart("blog") için JSON'u Blob ile 'application/json' tipinde gönder.

import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { API_BASE, ENDPOINTS, IMAGE_BASE } from '../../config/api';
import { showSuccess, showError } from './resuability/toastHelper';

// ---------- Helpers ----------
const extractData = (res) => {
  const d = res?.data;
  return d?.data ?? d?.result ?? d?.items ?? d?.content ?? d ?? [];
};

const fmtDate = (iso) =>
  !iso ? '' : new Date(iso).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });

const resolveImageUrl = (src) =>
  !src
    ? ''
    : /^https?:\/\//i.test(src)
    ? src
    : `${IMAGE_BASE}${src.startsWith('/') ? src : '/' + src}`;

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

// ---------- Main Component ----------
export default function Blog() {
  // Data
  const [items, setItems] = useState([]);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  // Selection + Form
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    header: '',
    title: '',
    content: '',
    image: '', // text URL (opsiyonel)
    categoryId: '', // dropdown
  });
  const [formError, setFormError] = useState({});

  // File state (multipart)
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(''); // object URL

  // UX: filter/sort/page
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState('blogId'); // blogId|header|title|categoryName|systemCreatedDate
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const anyOpen = showCreate || showEdit || showView || showDelete;

  // ---------- Effects ----------
  useEffect(() => {
    if (anyOpen) document.body.classList.add('modal-open');
    else document.body.classList.remove('modal-open');
    return () => document.body.classList.remove('modal-open');
  }, [anyOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (showCreate) return closeCreate();
      if (showEdit) return closeEdit();
      if (showView) return closeView();
      if (showDelete) return closeDelete();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showCreate, showEdit, showView, showDelete]);

  useEffect(() => {
    fetchBlogs();
    fetchCategories();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}${ENDPOINTS.BLOG.LIST}`);
      const data = extractData(res);
      const arr = Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : [];
      setItems(arr);
    } catch (e) {
      showError?.('Blog listesi yüklenemedi.') ?? console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE}${ENDPOINTS.BLOG_CATEGORY.LIST}`);
      const data = extractData(res);
      const arr = Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : [];
      setCats(arr);
    } catch (e) {
      showError?.('Kategori listesi yüklenemedi.') ?? console.error(e);
    }
  };

  // ---------- Derived (filter/sort/page) ----------
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((x) => {
      const id = (x.blogId ?? x.id ?? '').toString();
      const header = (x.header ?? '').toLowerCase();
      const title = (x.title ?? '').toLowerCase();
      const catName = (x.blogCategoryDto?.categoryName ?? '').toLowerCase();
      return id.includes(q) || header.includes(q) || title.includes(q) || catName.includes(q);
    });
  }, [items, query]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const va =
        sortKey === 'header'
          ? (a.header ?? '').toLowerCase()
          : sortKey === 'title'
          ? (a.title ?? '').toLowerCase()
          : sortKey === 'categoryName'
          ? (a.blogCategoryDto?.categoryName ?? '').toLowerCase()
          : sortKey === 'systemCreatedDate'
          ? new Date(a.systemCreatedDate || 0).getTime()
          : a.blogId ?? a.id ?? 0;
      const vb =
        sortKey === 'header'
          ? (b.header ?? '').toLowerCase()
          : sortKey === 'title'
          ? (b.title ?? '').toLowerCase()
          : sortKey === 'categoryName'
          ? (b.blogCategoryDto?.categoryName ?? '').toLowerCase()
          : sortKey === 'systemCreatedDate'
          ? new Date(b.systemCreatedDate || 0).getTime()
          : b.blogId ?? b.id ?? 0;
      const r = va < vb ? -1 : va > vb ? 1 : 0;
      return sortDir === 'asc' ? r : -r;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const total = sorted.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paged = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

  // ---------- Form Helpers ----------
  const resetForm = () => {
    setForm({ header: '', title: '', content: '', image: '', categoryId: '' });
    setFormError({});
    setFile(null);
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview('');
    }
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setFormError((p) => ({ ...p, [name]: undefined }));
  };

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return clearFile();
    setFile(f);
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFilePreview(URL.createObjectURL(f));
  };

  const clearFile = () => {
    setFile(null);
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFilePreview('');
    const input = document.getElementById('blog-image-file');
    if (input) input.value = '';
  };

  const openCreate = () => {
    closeAll();
    resetForm();
    setShowCreate(true);
  };
  const closeCreate = () => {
    setShowCreate(false);
    resetForm();
  };

  const openEdit = (row) => {
    closeAll();
    setSelected(row);
    resetForm();
    setForm({
      header: row?.header || '',
      title: row?.title || '',
      content: row?.content || '',
      image: row?.image || '',
      categoryId: row?.blogCategoryDto?.categoryId ?? row?.blogCategoryDto?.id ?? '',
    });
    setShowEdit(true);
  };
  const closeEdit = () => {
    setShowEdit(false);
    setSelected(null);
    resetForm();
  };

  const openView = (row) => {
    closeAll();
    setSelected(row);
    setShowView(true);
  };
  const closeView = () => {
    setShowView(false);
    setSelected(null);
  };

  const openDelete = (row) => {
    closeAll();
    setSelected(row);
    setShowDelete(true);
  };
  const closeDelete = () => {
    setShowDelete(false);
    setSelected(null);
  };

  const closeAll = () => {
    setShowCreate(false);
    setShowEdit(false);
    setShowView(false);
    setShowDelete(false);
  };

  // ---------- Validate ----------
  const validateBlog = () => {
    const err = {};
    if (!form.header?.trim()) err.header = 'Header zorunlu';
    if (!form.title?.trim()) err.title = 'Başlık zorunlu';
    if (!form.content?.trim()) err.content = 'İçerik zorunlu';
    if (!form.categoryId) err.categoryId = 'Kategori seçiniz';
    return err;
  };

  // ---------- Build Payloads ----------
  const jsonBody = () => ({
    header: form.header.trim(),
    title: form.title.trim(),
    content: form.content.trim(),
    image: form.image?.trim() || 'resim.png',
    blogCategoryDto: { categoryId: Number(form.categoryId) },
  });

  // blog parçasını application/json olarak ekle (kritik!)
  const buildMultipart = () => {
    const fd = new FormData();
    const blob = new Blob([JSON.stringify(jsonBody())], { type: 'application/json' });
    fd.append('blog', blob);
    if (file) fd.append('file', file); // tip otomatik belirlenir (image/*)
    return fd;
  };

  // ---------- CRUD ----------
  const submitCreate = async (e) => {
    e.preventDefault();
    const err = validateBlog();
    setFormError(err);
    if (Object.keys(err).length) return;

    try {
      if (file) {
        // MULTIPART: header set ETME — tarayıcı boundary ekler
        await axios.post(`${API_BASE}${ENDPOINTS.BLOG.CREATE}`, buildMultipart());
      } else {
        // JSON
        await axios.post(`${API_BASE}${ENDPOINTS.BLOG.CREATE}`, jsonBody());
      }
      showSuccess?.('Blog eklendi.') ?? console.log('Blog eklendi.');
      closeCreate();
      fetchBlogs();
    } catch (ex) {
      const msg = ex?.response?.data?.message || ex?.message || 'Blog eklenemedi.';
      showError?.(msg) ?? console.error(ex);
      setFormError(ex?.response?.data?.validationErrors || {});
    }
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    const err = validateBlog();
    setFormError(err);
    if (Object.keys(err).length) return;

    try {
      const id = selected?.blogId ?? selected?.id;
      if (id == null) throw new Error('Blog ID yok.');

      if (file) {
        // MULTIPART: header set ETME — tarayıcı boundary ekler
        await axios.put(`${API_BASE}${ENDPOINTS.BLOG.UPDATE(id)}`, buildMultipart());
      } else {
        // JSON
        await axios.put(`${API_BASE}${ENDPOINTS.BLOG.UPDATE(id)}`, jsonBody());
      }

      showSuccess?.('Blog güncellendi.') ?? console.log('Blog güncellendi.');
      closeEdit();
      fetchBlogs();
    } catch (ex) {
      const msg = ex?.response?.data?.message || ex?.message || 'Blog güncellenemedi.';
      showError?.(msg) ?? console.error(ex);
      setFormError(ex?.response?.data?.validationErrors || {});
    }
  };

  const confirmDelete = async () => {
    try {
      const id = selected?.blogId ?? selected?.id;
      if (id == null) throw new Error('Blog ID yok.');
      await axios.delete(`${API_BASE}${ENDPOINTS.BLOG.DELETE(id)}`);
      showSuccess?.('Blog silindi.') ?? console.log('Blog silindi.');
      closeDelete();
      fetchBlogs();
    } catch (ex) {
      const msg = ex?.response?.data?.message || ex?.message || 'Silinemedi.';
      showError?.(msg) ?? console.error(ex);
    }
  };

  // ---------- UI ----------
  const SortBtn = ({ k, children }) => (
    <button
      type="button"
      className="btn btn-link p-0 ms-1"
      title="Sırala"
      onClick={() => {
        if (sortKey === k) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        else {
          setSortKey(k);
          setSortDir('asc');
        }
      }}
    >
      {children} {sortKey === k ? (sortDir === 'asc' ? '▲' : '▼') : ''}
    </button>
  );

  return (
    <>
      <div className="container py-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h2 className="mb-0">Bloglar</h2>
          <div className="d-flex gap-2">
            <input
              placeholder="Ara (ID / Header / Başlık / Kategori)"
              className="form-control"
              style={{ minWidth: 280 }}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
            />
            <button className="btn btn-primary" onClick={openCreate}>
              Yeni Blog
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-striped table-bordered align-middle">
            <thead>
              <tr>
                <th style={{ width: 90 }}>
                  ID <SortBtn k="blogId" />
                </th>
                <th>
                  Header <SortBtn k="header" />
                </th>
                <th>
                  Başlık <SortBtn k="title" />
                </th>
                <th>
                  İçerik <SortBtn k="content" />
                </th>
                <th>
                  Kategori <SortBtn k="categoryName" />
                </th>
                <th style={{ width: 140 }}>Görsel</th>
                <th style={{ width: 220 }}>
                  Oluşturma <SortBtn k="systemCreatedDate" />
                </th>
                <th style={{ width: 160 }}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center">
                    <span className="spinner-border spinner-border-sm me-2" />
                    Yükleniyor...
                  </td>
                </tr>
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted">
                    Kayıt yok.
                  </td>
                </tr>
              ) : (
                paged.map((row) => (
                  <tr key={row.blogId ?? row.id}>
                    <td>{row.blogId ?? row.id}</td>
                    <td className="text-truncate" style={{ maxWidth: 240 }} title={row.header}>
                      {row.header}
                    </td>
                    <td className="text-truncate" style={{ maxWidth: 260 }} title={row.title}>
                      {row.title}
                    </td>
                    <td className="text-truncate" style={{ maxWidth: 260 }} title={row.content}>
                      {row.content}
                    </td>
                    <td>{row.blogCategoryDto?.categoryName ?? '-'}</td>
                    <td>
                      {row.image ? (
                        <img
                          src={resolveImageUrl(row.image)}
                          alt={row.title || 'image'}
                          style={{
                            maxWidth: 120,
                            maxHeight: 80,
                            objectFit: 'contain',
                            borderRadius: 6,
                            boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
                          }}
                        />
                      ) : (
                        <span className="text-muted small">—</span>
                      )}
                    </td>
                    <td>{fmtDate(row.systemCreatedDate)}</td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-secondary"
                          title="Detay"
                          onClick={() => openView(row)}
                        >
                          <i className="fa fa-eye" />
                        </button>
                        <button
                          className="btn btn-outline-primary"
                          title="Düzenle"
                          onClick={() => openEdit(row)}
                        >
                          <i className="fa fa-pen" />
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          title="Sil"
                          onClick={() => openDelete(row)}
                        >
                          <i className="fa fa-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="d-flex justify-content-between align-items-center mt-2">
          <div>
            Toplam <b>{total}</b> kayıt, Sayfa <b>{currentPage}</b> / <b>{pageCount}</b>
          </div>
          <div className="d-flex align-items-center gap-2">
            <select
              className="form-select"
              value={pageSize}
              onChange={(e) => {
                setPageSize(parseInt(e.target.value || '10', 10));
                setPage(1);
              }}
              style={{ width: 90 }}
            >
              {[5, 10, 20, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}/sayfa
                </option>
              ))}
            </select>
            <div className="btn-group">
              <button
                className="btn btn-outline-secondary"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ‹
              </button>
              <button
                className="btn btn-outline-secondary"
                disabled={currentPage >= pageCount}
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              >
                ›
              </button>
            </div>
          </div>
        </div>

        {/* CREATE MODAL */}
        {showCreate && (
          <div
            className="modal fade show d-block"
            tabIndex={-1}
            role="dialog"
            style={{ zIndex: 1050 }}
            onClick={closeCreate}
          >
            <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <form onSubmit={submitCreate}>
                  <div className="modal-header">
                    <h5 className="modal-title">Yeni Blog</h5>
                    <button type="button" className="btn-close" onClick={closeCreate} />
                  </div>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Header</label>
                        <input
                          name="header"
                          className={`form-control ${formError.header ? 'is-invalid' : ''}`}
                          value={form.header}
                          onChange={onChange}
                          required
                        />
                        {formError.header && (
                          <div className="invalid-feedback">{formError.header}</div>
                        )}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Başlık</label>
                        <input
                          name="title"
                          className={`form-control ${formError.title ? 'is-invalid' : ''}`}
                          value={form.title}
                          onChange={onChange}
                          required
                        />
                        {formError.title && (
                          <div className="invalid-feedback">{formError.title}</div>
                        )}
                      </div>
                      <div className="col-12">
                        <label className="form-label">İçerik</label>
                        <textarea
                          rows={5}
                          name="content"
                          className={`form-control ${formError.content ? 'is-invalid' : ''}`}
                          value={form.content}
                          onChange={onChange}
                          required
                        />
                        {formError.content && (
                          <div className="invalid-feedback">{formError.content}</div>
                        )}
                      </div>

                      {/* Görsel alanı */}
                      <div className="col-md-6">
                        <label className="form-label">Görsel (URL / Yol)</label>
                        <input
                          name="image"
                          className="form-control"
                          value={form.image}
                          onChange={onChange}
                          placeholder="ör. /upload/blog/ai.png veya https://..."
                        />
                        <div className="form-text">Dosya seçersen bu alan isteğe bağlıdır.</div>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Görsel Yükle (Dosya)</label>
                        <input
                          id="blog-image-file"
                          type="file"
                          accept="image/*"
                          className="form-control"
                          onChange={onFileChange}
                        />
                        {filePreview && (
                          <div className="mt-2 d-flex align-items-center gap-2">
                            <img
                              src={filePreview}
                              alt="preview"
                              style={{ maxHeight: 64, borderRadius: 6 }}
                            />
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={clearFile}
                            >
                              Dosyayı Kaldır
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Kategori */}
                      <div className="col-12">
                        <label className="form-label">Kategori</label>
                        <select
                          name="categoryId"
                          className={`form-select ${formError.categoryId ? 'is-invalid' : ''}`}
                          value={form.categoryId}
                          onChange={onChange}
                          required
                        >
                          <option value="">Seçiniz...</option>
                          {cats.map((c) => (
                            <option key={c.categoryId ?? c.id} value={c.categoryId ?? c.id}>
                              {c.categoryName}
                            </option>
                          ))}
                        </select>
                        {formError.categoryId && (
                          <div className="invalid-feedback">{formError.categoryId}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={closeCreate}>
                      Kapat
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Kaydet
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* EDIT MODAL */}
        {showEdit && (
          <div
            className="modal fade show d-block"
            tabIndex={-1}
            role="dialog"
            style={{ zIndex: 1050 }}
            onClick={closeEdit}
          >
            <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <form onSubmit={submitEdit}>
                  <div className="modal-header">
                    <h5 className="modal-title">Blogu Düzenle</h5>
                    <button type="button" className="btn-close" onClick={closeEdit} />
                  </div>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Header</label>
                        <input
                          name="header"
                          className={`form-control ${formError.header ? 'is-invalid' : ''}`}
                          value={form.header}
                          onChange={onChange}
                          required
                        />
                        {formError.header && (
                          <div className="invalid-feedback">{formError.header}</div>
                        )}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Başlık</label>
                        <input
                          name="title"
                          className={`form-control ${formError.title ? 'is-invalid' : ''}`}
                          value={form.title}
                          onChange={onChange}
                          required
                        />
                        {formError.title && (
                          <div className="invalid-feedback">{formError.title}</div>
                        )}
                      </div>
                      <div className="col-12">
                        <label className="form-label">İçerik</label>
                        <textarea
                          rows={5}
                          name="content"
                          className={`form-control ${formError.content ? 'is-invalid' : ''}`}
                          value={form.content}
                          onChange={onChange}
                          required
                        />
                        {formError.content && (
                          <div className="invalid-feedback">{formError.content}</div>
                        )}
                      </div>

                      {/* Görsel alanı */}
                      <div className="col-md-6">
                        <label className="form-label">Görsel (URL / Yol)</label>
                        <input
                          name="image"
                          className="form-control"
                          value={form.image}
                          onChange={onChange}
                          placeholder="ör. /upload/blog/ai.png veya https://..."
                        />
                        <div className="form-text">Dosya seçersen bu alan isteğe bağlıdır.</div>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Görsel Yükle (Dosya)</label>
                        <input
                          id="blog-image-file"
                          type="file"
                          accept="image/*"
                          className="form-control"
                          onChange={onFileChange}
                        />
                        {filePreview && (
                          <div className="mt-2 d-flex align-items-center gap-2">
                            <img
                              src={filePreview}
                              alt="preview"
                              style={{ maxHeight: 64, borderRadius: 6 }}
                            />
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={clearFile}
                            >
                              Dosyayı Kaldır
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Kategori */}
                      <div className="col-12">
                        <label className="form-label">Kategori</label>
                        <select
                          name="categoryId"
                          className={`form-select ${formError.categoryId ? 'is-invalid' : ''}`}
                          value={form.categoryId}
                          onChange={onChange}
                          required
                        >
                          <option value="">Seçiniz...</option>
                          {cats.map((c) => (
                            <option key={c.categoryId ?? c.id} value={c.categoryId ?? c.id}>
                              {c.categoryName}
                            </option>
                          ))}
                        </select>
                        {formError.categoryId && (
                          <div className="invalid-feedback">{formError.categoryId}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={closeEdit}>
                      Kapat
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Güncelle
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* VIEW MODAL */}
        {showView && selected && (
          <div
            className="modal fade show d-block"
            tabIndex={-1}
            role="dialog"
            style={{ zIndex: 1050 }}
            onClick={closeView}
          >
            <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Blog Detayı</h5>
                  <button type="button" className="btn-close" onClick={closeView} />
                </div>
                <div className="modal-body">
                  <div className="mb-2">
                    <b>ID:</b> {selected.blogId ?? selected.id}
                  </div>
                  <div className="mb-2">
                    <b>Header:</b> {selected.header}
                  </div>
                  <div className="mb-2">
                    <b>Başlık:</b> {selected.title}
                  </div>
                  <div className="mb-2">
                    <b>Kategori:</b> {selected.blogCategoryDto?.categoryName ?? '-'}
                  </div>
                  <div className="mb-2">
                    <b>Görsel:</b>
                    <div className="mt-1">
                      {selected.image ? (
                        <img
                          src={resolveImageUrl(selected.image)}
                          alt={selected.title || 'image'}
                          style={{
                            maxWidth: 200,
                            maxHeight: 140,
                            objectFit: 'contain',
                            borderRadius: 8,
                          }}
                        />
                      ) : (
                        <span className="text-muted small">—</span>
                      )}
                    </div>
                  </div>
                  <div className="mb-2">
                    <b>İçerik:</b>
                    <div className="mt-1" style={{ whiteSpace: 'pre-wrap' }}>
                      {selected.content}
                    </div>
                  </div>
                  <div className="mb-2">
                    <b>Oluşturma:</b> {fmtDate(selected.systemCreatedDate)}
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={closeView}>
                    Kapat
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DELETE MODAL */}
        {showDelete && selected && (
          <div
            className="modal fade show d-block"
            tabIndex={-1}
            role="dialog"
            style={{ zIndex: 1050 }}
            onClick={closeDelete}
          >
            <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title text-danger">Silme Onayı</h5>
                  <button type="button" className="btn-close" onClick={closeDelete} />
                </div>
                <div className="modal-body">
                  <div className="mb-2">
                    <b>{selected.title}</b> başlıklı blogu silmek istediğinize emin misiniz?
                  </div>
                  <div className="text-muted">
                    <b>ID:</b> {selected.blogId ?? selected.id}
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={closeDelete}>
                    Vazgeç
                  </button>
                  <button className="btn btn-danger" onClick={confirmDelete}>
                    Sil
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Global Backdrop */}
        <GlobalBackdrop show={anyOpen} />
      </div>
    </>
  );
}
