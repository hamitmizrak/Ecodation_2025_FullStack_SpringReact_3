// IMPORT

import React, {useEffect, useMemo, useState} from 'react';
import axios from 'axios';
import {API_BASE, ENDPOINTS, IMAGE_BASE} from '../../config/api';
import {showSuccess, showError} from './resuability/toastHelper';
import {withTranslation} from 'react-i18next';

// ---------- Helpers ----------
// API cevabından data’yı çeşitli yapılar için çıkarır
const extractData = (res) => {
    const d = res?.data;
    return d?.data ?? d?.result ?? d?.items ?? d?.content ?? d ?? [];
};

// ISO tarih formatını yerel tarih-saat formatına çevirir
const fmtDate = (iso) =>
    !iso ? '' : new Date(iso).toLocaleString('tr-TR', {timeZone: 'Europe/Istanbul'});

// Resim URL'sini tam hale getirir (mutlak URL veya IMAGE_BASE ile)
const resolveImageUrl = (src) =>
    !src
        ? ''
        : /^https?:\/\//i.test(src)
            ? src
            : `${IMAGE_BASE}${src.startsWith('/') ? src : '/' + src}`;

// Basit global backdrop (modal arka planı)
function GlobalBackdrop({show, onClose}) {
    if (!show) return null;
    return (
        <div
            className="modal-backdrop fade show"
            style={{zIndex: 1040}}
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

    // FORM DATA
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
            const res = await axios.get(`${API_BASE}${ENDPOINTS.BLOGS.LIST}`);
            const data = extractData(res);
            const arr = Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : [];
            setItems(arr);
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
            setCats(arr);
        } catch (err) {
            showError?.('Blog Kategori Listesi Yüklenemedi') ?? console.error(err);
        } finally {
            // Liste geldiğinde Loading dursun
            setLoading(false);
        }
    };

    // ---------- Derived (filter/sort/page) ----------
    // FILTERED (USE MEMO)
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

    // SORTED (USE MEMO)
    const sorted = useMemo(() => {
        // Yeni bir dizi oluştur(filtrelenmiş veriden)
        const arr = [...filtered];

        // Sıralama
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

    // PAGINATION CALCULATIONS
    const total = sorted.length;
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(page, pageCount);

    // PAGED (USE MEMO)
    const paged = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return sorted.slice(start, start + pageSize);
    }, [sorted, currentPage, pageSize]);

    // ---------- onChange ----------
    // ONCHANGE HELPERS
    const resetForm = () => {
        // Formu sıfırla
        setForm({
            header: '',
            title: '',
            content: '',
            categoryId: '',
            image: '',
        });
        // Hataları sıfırla
        setFormErrors({});
        setFile(null);
        // Resim URL boşalt
        if (setFilePreview) {
            URL.revokeObjectURL(filePreview);
            setFilePreview('');
        }
    };

    // FORM DATA ALMAK
    const onChange = (e) => {
        // Object destructuring
        const {name, value} = e.target;

        setForm((prev) => ({...prev, [name]: value}));
        //setFormErrors((prev) => ({ ...prev, [name]: '' })); // Hata temizle
        setFormErrors((prev) => ({...prev, [name]: undefined})); // Hata temizle
    };

    // CLEAR FILE
    const clearFile = () => {
        setFile(null);
        if (filePreview) {
            URL.revokeObjectURL(filePreview);
        }
        setFilePreview('');
        const input = document.getElementById('blog-image-file');
        if (input) input.value = '';
    };

    // FILE CHANGE
    const onFileChange = (e) => {
        const file = e.target.files?.[0];
        //const file = e.target.files?.[0] || null;
        if (!file) return clearFile();
        setFile(file);

        if (filePreview) {
            URL.revokeObjectURL(filePreview);
        }
        setFilePreview(URL.createObjectURL(file));
    };

    // CLOSE ALL MODALS
    const closeAll = () => {
        setShowCreate(false);
        setShowEdit(false);
        setShowView(false);
        setShowDelete(false);
    };

    // OPEN CREATE MODAL
    const openCreate = () => {
        closeAll();
        resetForm();
        setShowCreate(true);
    };

    // CLOSE CREATE MODAL
    const closeCreate = () => {
        setShowCreate(false);
        resetForm();
    };

    // OPEN EDIT MODAL
    const openEdit = (row) => {
        closeAll();
        setSelected(row);
        resetForm();
        setForm({
            header: row.header || '',
            title: row.title || '',
            content: row.content || '',
            image: row.image || '',
            categoryId: row.blogCategoryDto?.categoryId ?? row.blogCategoryDto?.id ?? '',
        });
        setShowEdit(true);
    };

    // CLOSE EDIT MODAL
    const closeEdit = () => {
        setShowEdit(false);
        setSelected(null);
        resetForm();
    };

    // OPEN VIEW MODAL
    const openView = (row) => {
        closeAll();
        setSelected(row);
        setShowView(true);
    };
    // CLOSE VIEW MODAL
    const closeView = () => {
        setShowView(false);
        setSelected(null);
    };

    // OPEN DELETE MODAL
    const openDelete = (row) => {
        closeAll();
        setSelected(row);
        setShowDelete(true);
    };

    // CLOSE DELETE MODAL
    const closeDelete = () => {
        setShowDelete(false);
        setSelected(null);
    };

    // ----------- Validate Form -----------
    const validateBlog = () => {
        // HATALARI SIFIRLA
        const errors = {};

        if (!form.header?.trim()) errors.header = 'Başlık zorunludur.';

        if (!form.title || form.title.trim() === '') {
            errors.title = 'Title zorunludur.';
        }
        if (!form.content || form.content.trim() === '') {
            errors.content = 'İçerik zorunludur.';
        }
        if (!form.categoryId || form.categoryId.toString().trim() === '') {
            errors.categoryId = 'Kategori zorunludur.';
        }
        setFormErrors(errors);
        return errors;
    };

    // ----------- Build Payloads  -----------
    const jsonBody = () => ({
        header: form.header.trim(),
        title: form.title.trim(),
        content: form.content.trim(),
        image: form.image?.trim() || 'resim.png',
        blogCategoryId: {
            // categoryId: parseInt(form.categoryId),
            categoryId: Number(form.categoryId),
        },
    });

    // application/json payload
    const buildMultipart = () => {
        const fd = new FormData();
        const blob = new Blob([JSON.stringify(jsonBody())], {type: 'application/json'});
        fd.append('blog', blob);
        if (file) {
            fd.append('file', file);
        }
        return fd;
    };

    // ---------- UI ----------
    const SortBtn = ({k, children}) => (
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

    // ----------- CRUD  -----------
    // -----------------------------

    // CREATE
    const submitCreate = async (event) => {
        // Browser default davranışını engelle
        event.preventDefault();

        // Form doğrulama
        const errors = validateBlog();
        setFormErrors(errors);

        // Hata varsa devam etme
        if (Object.keys(errors).length > 0) {
            showError('Lütfen form hatalarını düzeltin.');
            return;
        }

        // LOADING
        setLoading(false);

        // TRY CATCH
        try {
            // Eğer File varsa multipart, yoksa json gönder
            if (file) {
                // MULTIPART:  header set ETME - tarayıcı boundary ekler
                await axios.post(`${API_BASE}${ENDPOINTS.BLOGS.CREATE}`, buildMultipart());
            } else {
                // JSON
                await axios.post(`${API_BASE}${ENDPOINTS.BLOGS.CREATE}`, jsonBody());
            }
            showSuccess(`Blog başarıyla oluşturuldu.`);
            console.log(`Blog başarıyla oluşturuldu.`);
            //closeCreate(); //4444
            //fetchBlogs();
        } catch (err) {
            showError('Blog oluşturulamadı.') ?? console.error(err);
            const msg = err?.response?.data?.message || 'Blog oluşturulamadı.';
            showError?.(msg) ?? console.error(err);
            setLoading(false);
        } finally {
            setLoading(false);
            // Modal kapat
            closeCreate();
            // Listeyi yenile
            fetchBlogs();
        }
    }; // end submitCreate

    // UPDATE
    const submitEdit = async (event) => {
        // Browser default davranışını engelle
        event.preventDefault();

        // Form doğrulama
        const errors = validateBlog();
        setFormErrors(errors);

        // Hata varsa devam etme
        if (Object.keys(errors).length > 0) {
            showError('Lütfen form hatalarını düzeltin.');
            return;
        }

        // TRY CATCH
        try {

            // ID
            const id = selected?.blogId || selected?.id;
            if (!id) throw new Error('Geçersiz blog seçimi.');
            if (id == null) throw new Error('Blog ID Yoktur.');

            // Eğer File varsa multipart, yoksa json gönder
            if (file) {
                // MULTIPART:  header set ETME - tarayıcı boundary ekler
                await axios.post(`${API_BASE}${ENDPOINTS.BLOGS.UPDATE(id)}`, buildMultipart());
            } else {
                // JSON
                await axios.post(`${API_BASE}${ENDPOINTS.BLOGS.UPDATE(id)}`, jsonBody());
            }
            showSuccess(`Blog başarıyla güncellendi.`);
            console.log(`Blog başarıyla güncellendi.`);
        } catch (err) {
            showError('Blog oluşturulamadı.') ?? console.error(err);
            const msg = err?.response?.data?.message || 'Blog oluşturulamadı.';
            showError?.(msg) ?? console.error(err);
            setLoading(true);
        } finally {
            setLoading(false);
            // Modal kapat
            closeEdit();
            // Listeyi yenile
            fetchBlogs();
        }
    }; // end submitCreate

    // DELETE
    const submitDelete = async () => {
        // LOADING
        setLoading(true);

        // TRY CATCH
        try {
            // ID
            const id = selected?.blogId || selected?.id;
            if (!id) throw new Error('Geçersiz blog seçimi.');
            if (id == null) throw new Error('Blog ID Yoktur.');

            // API ÇAĞRI
            await axios.delete(`${API_BASE}${ENDPOINTS.BLOGS.DELETE(id)}`);
            showSuccess?.(`Blog başarıyla silindi.`) ?? console.log(`Blog başarıyla silindi.`);
        } catch (err) {
            showError('Blog silinemedi.') ?? console.error(err);
            const msg = err?.response?.data?.message || 'Blog silinemedi.';
            showError?.(msg) ?? console.error(err);
            setLoading(false);
        } finally {
            setLoading(false);
            // Modal kapat
            closeDelete();
            // Listeyi yenile
            fetchBlogs();
        }
    }; // end submitDelete

    // RETURN
    return (
        <>
            <div className="container py-4">
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <h2 className="mb-0">Bloglar</h2>
                    <div className="d-flex gap-2">
                        <input
                            placeholder="Ara (ID/Başlık/İçerik/Kategori)"
                            className="form-control"
                            style={{minWidth: 280}}
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value)
                                setPage(1)
                            }}
                        />
                        <button className="btn btn-primary" onClick={openCreate}>Yeni Blog</button>
                    </div>
                </div>

                {/*TABLE*/}
                <div className="table-responsive">
                        <table className="table table-striped table-border table alig-middle">
                            {/*HEAD*/}
                            <thead>
                            <tr>
                                <th style={{minWidth: 90}}>ID <SortBtn k="blogId"/></th>
                                <th style={{minWidth: 150}}>Görsel</th>
                                <th>Başlık <SortBtn k="header"/></th>
                                <th>Alt Başlık <SortBtn k="title"/></th>
                                <th>İçerik <SortBtn k="content"/></th>
                                <th>Kategori <SortBtn k="categoryName"/></th>
                                <th style={{minWidth: 230}}>Oluşturma <SortBtn k="systemCreatedDate"/></th>
                                <th style={{width: 160}}>İşlemler</th>
                            </tr>
                            </thead>

                            {/*BODY*/}
                            <tbody>
                            {loading ? (
                                <tr colSpan={4} className="text-center">
                                    <span className="spinner-border spinner-border-sm me-2"/>
                                    Yükleniyor...
                                </tr>
                            ) : paged.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center text-muted">Kayıt Yoktur</td>
                                </tr>
                            ) : (
                                paged.map((row) => (
                                    <tr key={row.categoryId ?? row.id}>
                                        <td>{row.categoryId ?? row.id}</td>
                                        <td>{row.categoryName}</td>
                                        <td>{fmtDate(row.systemCreatedDate)}</td>
                                        <td>
                                            <div className="btn-group btn-group-sm">

                                                {/*GÜNCELLE*/}
                                                <button
                                                    className="btn btn-outline-primary"
                                                    title="Güncelle"
                                                    onClick={() => openEdit(row)}
                                                >
                                                    <i className="fa fa-pen"></i>
                                                </button>

                                                {/*DETAY*/}
                                                <button
                                                    className="btn btn-outline-secondary" title="Detay"
                                                    onClick={() => openView(row)}
                                                >
                                                    <i className="fa fa-eye"></i>
                                                </button>

                                                {/*SİL*/}
                                                <button
                                                    className="btn btn-outline-danger"
                                                    title="Silmek"
                                                    onClick={() => openDelete(row)}
                                                >
                                                    <i className="fa fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )
                            }
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
                                ‹ Önceki
                            </button>
                            <button
                                className="btn btn-outline-secondary"
                                disabled={currentPage >= pageCount}
                                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                            >
                                › Sonraki
                            </button>
                        </div>
                    </div>
                </div>

                {/*CREATE MODAL*/}
                {/*{showCreate && (
                    <div
                        className="modal fade show d-block"
                        tabIndex={-1}
                        role="dialog"
                        style={{zIndex:1050}}
                        onClick={closeCreate}>
                        <div className="modal-dialog" onClick={(e)=> e.stopPropagation()}>
                            <div className="modal-content">
                                <form action=""></form>
                            </div>
                        </div>

                        <div
                )}*/}

            </div>
            {/*end container*/}


        </>
    ); // end Return
} // end Blog

// I18N (InternationalizatioN) Desteği
export default withTranslation()(Blog);
