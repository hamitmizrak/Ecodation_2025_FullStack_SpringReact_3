// src/writer/BlogApi.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { listBlogCategories } from '../../features/blogCategory/blogCategoryService';
import { listBlogs, createBlogWithImage, deleteBlog } from '../../features/blog/blogService';

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

export default function BlogApi() {
  // form
  const empty = { title: '', content: '', categoryId: '' };
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [pct, setPct] = useState(0);
  const [errs, setErrs] = useState({ title: '', content: '', categoryId: '', general: '' });
  const invalid = useMemo(
    () => ({ title: !!errs.title, content: !!errs.content, categoryId: !!errs.categoryId }),
    [errs]
  );

  // data
  const [cats, setCats] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshCats = async () => {
    try {
      const res = await listBlogCategories();
      const data = res?.data?.data || res?.data?.result || res?.data || [];
      setCats(Array.isArray(data) ? data : data.content || []);
    } catch {}
  };
  const refreshBlogs = async () => {
    setLoading(true);
    try {
      const res = await listBlogs();
      const data = res?.data?.data || res?.data?.result || res?.data || [];
      setBlogs(Array.isArray(data) ? data : data.content || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    refreshCats();
    refreshBlogs();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    setErrs((s) => ({ ...s, [name]: '', general: '' }));
  };
  const onFile = (e) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
    setPct(0);
  };
  const validate = () => {
    const e = { title: '', content: '', categoryId: '' };
    if (!form.title) e.title = 'Başlık zorunlu';
    if (!form.content) e.content = 'İçerik zorunlu';
    if (!form.categoryId) e.categoryId = 'Kategori zorunlu';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e0 = validate();
    setErrs((s) => ({ ...s, ...e0 }));
    if (e0.title || e0.content || e0.categoryId) return;

    try {
      await createBlogWithImage(
        {
          title: form.title,
          content: form.content,
          categoryId: form.categoryId,
        },
        file,
        (p) => setPct(p)
      );

      // Temizle + listeyi yenile
      setForm(empty);
      setFile(null);
      setPreview(null);
      setPct(0);
      setErrs({ title: '', content: '', categoryId: '', general: '' });
      refreshBlogs();
    } catch (ex) {
      const be = ex?.response?.data;
      const { general, fields } = normalizeBackendError(be);
      setErrs((s) => ({
        ...s,
        title: fields.title || s.title,
        content: fields.content || s.content,
        categoryId: fields.categoryId || s.categoryId,
        general: general || 'Kayıt başarısız',
      }));
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Silmek istediğinize emin misiniz?')) return;
    try {
      await deleteBlog(id);
      refreshBlogs();
    } catch (ex) {
      alert(ex?.response?.data?.message || ex.message || 'Silme başarısız');
    }
  };

  return (
    <div>
      <h5 className="mb-3">
        <i className="fa fa-pen-to-square me-2" />
        Blog Yönetimi (Writer)
      </h5>

      <div className="row g-3">
        <div className="col-12 col-xl-5">
          <div className="card border-0 shadow-sm">
            <div className="card-header fw-semibold">Yeni Blog Yazısı</div>
            <div className="card-body">
              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label className="form-label">
                    Başlık <span className="text-danger">*</span>
                  </label>
                  <input
                    name="title"
                    className={`form-control ${invalid.title ? 'is-invalid' : ''}`}
                    value={form.title}
                    onChange={onChange}
                    placeholder="Yazı başlığı..."
                  />
                  <div className="invalid-feedback">{errs.title}</div>
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    Kategori <span className="text-danger">*</span>
                  </label>
                  <select
                    name="categoryId"
                    className={`form-select ${invalid.categoryId ? 'is-invalid' : ''}`}
                    value={form.categoryId}
                    onChange={onChange}
                  >
                    <option value="">Seçiniz…</option>
                    {cats.map((c) => (
                      <option key={c.id ?? c.categoryId} value={c.id ?? c.categoryId}>
                        {c.name ?? c.categoryName}
                      </option>
                    ))}
                  </select>
                  <div className="invalid-feedback">{errs.categoryId}</div>
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    İçerik <span className="text-danger">*</span>
                  </label>
                  <textarea
                    name="content"
                    className={`form-control ${invalid.content ? 'is-invalid' : ''}`}
                    rows={6}
                    value={form.content}
                    onChange={onChange}
                    placeholder="Markdown/HTML/metin..."
                  />
                  <div className="invalid-feedback">{errs.content}</div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Kapak Görseli (opsiyonel)</label>
                  <input type="file" accept="image/*" className="form-control" onChange={onFile} />
                  {preview && (
                    <img
                      src={preview}
                      alt="preview"
                      style={{ maxWidth: 160, marginTop: 8, borderRadius: 8 }}
                    />
                  )}
                  {pct > 0 && pct < 100 && (
                    <div
                      className="progress mt-2"
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={pct}
                    >
                      <div className="progress-bar" style={{ width: `${pct}%` }}>
                        {pct}%
                      </div>
                    </div>
                  )}
                </div>

                {errs.general && <div className="text-danger small mb-2">{errs.general}</div>}
                <button className="btn btn-primary" type="submit">
                  <i className="fa fa-save me-1" />
                  Kaydet
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Liste */}
        <div className="col-12 col-xl-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header fw-semibold d-flex align-items-center justify-content-between">
              <span>Yazılarım</span>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={refreshBlogs}
                disabled={loading}
              >
                <i className={`fa ${loading ? 'fa-spinner fa-spin' : 'fa-rotate'}`} /> Yenile
              </button>
            </div>
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Başlık</th>
                    <th>Kategori</th>
                    <th className="d-none d-lg-table-cell">Özet</th>
                    <th className="text-end">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {blogs.map((b, idx) => (
                    <tr key={b.id ?? idx}>
                      <td>{idx + 1}</td>
                      <td>{b.title}</td>
                      <td>{b.categoryName ?? b.category?.name}</td>
                      <td className="d-none d-lg-table-cell text-muted">
                        {(b.content || '').slice(0, 60)}
                        {(b.content || '').length > 60 ? '…' : ''}
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          {/* düzenleme istersen updateBlogWithImage ile modal açabiliriz */}
                          <button className="btn btn-outline-danger" onClick={() => onDelete(b.id)}>
                            <i className="fa fa-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {blogs.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center text-muted py-4">
                        Yazı yok.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* pagination eklemek istersen burada */}
          </div>
        </div>
      </div>
    </div>
  );
}
