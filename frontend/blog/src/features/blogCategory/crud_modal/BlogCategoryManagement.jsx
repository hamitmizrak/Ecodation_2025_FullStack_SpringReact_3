// REACT
import React, {useEffect, useMemo, useState} from 'react';
import Swal from 'sweetalert2';

// TOAST
import toast from 'react-hot-toast';
import ReusabilityToast from '../../reusability/ReusabilityToast';

// ROUTER
// import {useNavigate} from 'react-router-dom';

// API LIST CALL
import BlogCategoryApiService from '../../services/BlogCategoryApiService';

// I18N
import {withTranslation} from 'react-i18next';

// FUNCTION
function BlogCategoryManagement({props, t, i18n}) {
    // ROUTER
    //let navigate = useNavigate();

    // LIST STATE
    //const [] = React.useState();
    const [blogCategoryApiListData, setBlogCategoryApiListData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // MODAL STATE
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('show'); // "show" | "create" | "edit"
    const [selectedCategory, setSelectedCategory] = useState(null);

    // FORM STATE (create / update)
    const [formData, setFormData] = useState({
        categoryName: '',
    });
    const [saving, setSaving] = useState(false);

    // FILTER + PAGINATION STATE
    const [searchTerm, setSearchTerm] = useState('');
    const [pageSize, setPageSize] = useState(7);
    const [currentPage, setCurrentPage] = useState(1);

    // =====================================================
    //      TOAST HELPER (react-hot-toast + ReusabilityToast)
    // =====================================================
    /**
     * variant:
     *  - "create"  -> yeşil arka plan
     *  - "update"  -> mavi arka plan
     *  - "delete"  -> kırmızı arka plan
     *  - default   -> gri / nötr
     */
    const showToast = (title, variant = 'default') => {
        let style = {
            borderRadius: '10px',
            padding: '10px',
            color: '#ffffff',
            fontWeight: 500,
            fontSize: '0.9rem',
        };
        let icon = 'ℹ️';

        switch (variant) {
            case 'create':
                style.background = '#146c43'; // yeşil
                icon = '✅';
                break;
            case 'update':
                style.background = '#0d6efd'; // mavi
                icon = 'ℹ️';
                break;
            case 'delete':
                style.background = '#842029'; // kırmızı
                icon = '🗑️';
                break;
            default:
                style.background = '#343a40'; // koyu gri
                icon = 'ℹ️';
                break;
        }

        toast(title, {
            icon,
            style,
            duration: 2500,
        });
    };

    // =====================================================
    //      LİSTEYİ ÇEK
    // =====================================================
    useEffect(() => {
        fetchBlogList();
        // fetchBlogList().then(
        //     () => {
        //         showToast("Blog Kategori Listeleme", "list");
        //     }
        // ).catch(() => showToast("Blog Kategori Listelememedi", "list"));
    }, []);

    // FUNCTION
    // FETCH BLOG LIST ASENKRON
    const fetchBlogList = async () => {
        try {
            // Loading
            setLoading(true);
            setError('');

            // ASENKRON API ÇAĞRI
            // const response = await fetch('http://localhost:9999/blog/category/api/v1/list');
            const response = await BlogCategoryApiService.objectApiList();
            if (response.status === 200) {
                setBlogCategoryApiListData(response.data);
                console.log(response);
                console.log(response.data);
                console.log(response.status);
                console.log(response.headers);
            }
        } catch (err) {
            console.error('Blog Category fetchBlogList: ', err);
            setError('Blog kategori listesi alınırken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    //      FILTER + PAGINATION (DATALIST DESTEKLİ)
    // =====================================================
    useEffect(() => {
        setCurrentPage(1); // Paginatin ilk sayfada başlat
    }, [searchTerm, pageSize, blogCategoryApiListData.length]);

    // =======================================================================
    /*
      USEMEMO (expensive) hesaplanması maliyetli(pahalı) işlemleri sürekli hesaplamamak için kullandığımız bir React hooksu'dur

      Genellikle: büyük array, filtrelemeler, ağır hesaplamalarda, çok karmaşık obje için kullanırız.
      Amaç: Her render'dan sonra tekrar çalışmasın ancak ilgili parametreler çalışsın(state/props) değiştiğinde tekrar hesaplama yapsın.
      */
    const {pageData, totalItems, totalPages} = useMemo(() => {
        // Search (Küçük karakter+boşluksuz)
        const normalized = searchTerm.toLowerCase().trim();
        // Filter
        const filtered = blogCategoryApiListData.filter((cat) => {
            if (!normalized) return true;

            // Backentten gelen gelen veriler
            const idStr = String(cat.categoryId ?? '').toLowerCase();
            const nameStr = (cat.categoryName ?? '').toLowerCase();
            const dateStr = (cat.systemCreatedDate ?? '').toLowerCase();
            return (
                idStr.includes(normalized) || nameStr.includes(normalized) || dateStr.includes(normalized)
            );
        });

        // Pagination
        const total = filtered.length || 0;
        const pages = total === 0 ? 1 : Math.ceil(total / pageSize);

        const safeCurrentPage = Math.min(Math.max(1, currentPage), pages);
        const startIndex = (safeCurrentPage - 1) * pageSize;
        const paged = filtered.slice(startIndex, startIndex + pageSize);

        return {
            pageData: paged,
            totalItems: total,
            totalPages: pages,
        };
    }, [blogCategoryApiListData, searchTerm, pageSize, currentPage]);

    // =======================================================================
    // PAGINATION
    // =======================================================================
    // GOTO PAGE
    const goToPage = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    const getPageNumbers = () => {
        const maxButtons = 5;
        const pages = [];

        let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
        let end = start + maxButtons - 1;

        if (end > totalPages) {
            end = totalPages;
            start = Math.max(1, end - maxButtons + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    // =======================================================================
    // MODAL HELPER FUNCTIONS
    // =======================================================================
    // CREATE MODAL ACTIVE
    const openCreateModal = () => {
        setModalMode('create');
        setSelectedCategory(null);
        setFormData({
            categoryName: '',
        });
        setIsModalOpen(true);
    };

    // SHOW MODAL ACTIVE
    const openShowModal = (category) => {
        setModalMode('show');
        setSelectedCategory(category);
        setIsModalOpen(true);
    };

    // EDIT MODAL ACTIVE
    const openEditModal = (category) => {
        setModalMode('edit');
        setSelectedCategory(category);
        setFormData({
            categoryName: category.categoryName || '',
        });
        setIsModalOpen(true);
    };

    // CLOSE MODAL ACTIVE
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedCategory(null);
        setFormData({
            categoryName: '',
        });
        setModalMode('show');
    };

    // =====================================================
    //      FORM HANDLE
    // =====================================================
    const handleChange = (event) => {
        const {name, value} = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // =======================================================================
    // FORM SUBMIT FUNCTIONS ===> Formda gelen verileri İşlem yapmak
    // =======================================================================
    const handleSubmit = async (event) => {
        // Browser sen dur hiç bir şey yapma ben biliyorum ne yapacağımı
        event.preventDefault();

        // Default
        setSaving(true);
        setError('');

        try {
            if (modalMode === 'create') {
                const response = await BlogCategoryApiService.objectApiCreate(formData);
                if (response.status === 201 || response.status === 200) {
                    await fetchBlogList();
                    closeModal();
                    showToast('Blog Kategori Oluşturuldu', 'create');
                }
            } else if (modalMode === 'edit' && selectedCategory && selectedCategory.categoryId) {
                const response = await BlogCategoryApiService.objectApiUpdate(
                    selectedCategory.categoryId,
                    formData
                );
                if (response.status === 200) {
                    await fetchBlogList();
                    closeModal();
                    showToast('Blog Kategori Güncellendi', 'update');
                }
            }
        } catch (err) {
            console.error('handleSubmit error:', err);
            setError(
                modalMode === 'create'
                    ? 'Kategori oluşturulurken bir hata oluştu.'
                    : 'Kategori güncellenirken bir hata oluştu.'
            );
        } finally {
            setSaving(false);
        }
    };

    // =====================================================
    //      DELETE (SweetAlert2 + TOAST)
    // =====================================================
    const handleDelete = async (category) => {
        const result = await Swal.fire({
            title: `"${category.categoryName}" silinsin mi?`,
            text: 'Bu işlem geri alınamaz.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Evet, sil',
            cancelButtonText: 'Vazgeç',
        });

        if (!result.isConfirmed) return;

        try {
            setError('');
            const response = await BlogCategoryApiService.objectApiDelete(category.categoryId);
            if (response.status === 200) {
                await fetchBlogList();
                showToast('Kategori başarıyla silindi', 'delete');
            }
        } catch (err) {
            console.error('handleDelete error:', err);
            setError('Kategori silinirken bir hata oluştu.');
        }
    };

    // =====================================================
    //      MODAL TITLE & BODY
    // =====================================================
    const getModalTitle = () => {
        if (modalMode === 'create') return 'Yeni Blog Kategorisi Oluştur';
        if (modalMode === 'edit') return 'Blog Kategorisini Güncelle';
        return 'Blog Kategorisi Detayı';
    };

    // Modal Body
    const renderModalBody = () => {
        if (modalMode === 'show' && selectedCategory) {
            return (
                <div className="mb-2">
                    <div className="mb-2">
                        <strong>{t('id')}:</strong> {selectedCategory.categoryId}
                    </div>
                    <div className="mb-2">
                        <strong>{t('blog_category_name')}:</strong> {selectedCategory.categoryName}
                    </div>
                    <div className="mb-2">
                        <strong>{t('date')}:</strong> {selectedCategory.systemCreatedDate || '-'}
                    </div>
                </div>
            );
        }

        return (
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">{t('blog_category_name')}</label>
                    <input
                        type="text"
                        name="categoryName"
                        className="form-control"
                        value={formData.categoryName}
                        onChange={handleChange}
                        placeholder="Örneğin: Backend, Frontend, Yapay Zeka..."
                        required
                    />
                </div>

                <div className="d-flex justify-content-end gap-2">
                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={closeModal}
                        disabled={saving}
                    >
                        Kapat
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? 'Kaydediliyor...' : modalMode === 'create' ? t('create') : t('update')}
                    </button>
                </div>
            </form>
        );
    };

    //////////////////////////////////////////////////////////////////////////
    // =======================================================================
    // JSX
    // =======================================================================

    return (
        <React.Fragment>
            {/* Toaster provider (sağ alt, global varsayılan) */}
            <ReusabilityToast/>

            <br/>

            {/* Başlık: animate.css ile */}
            <h1 className="text-center display-5 mt-4 b-4 animate__animated animate__fadeInDown">
                {t('blog_category_list')}
            </h1>

            {/* Filter + Datalist + Yeni Kategori Butonu */}
            <div className="container mb-3">
                <div className="row align-items-end g-2">
                    <div className="col-md-4">
                        <label className="form-label fw-semibold">Filtrele (ID / İsim / Tarih)</label>
                        <input
                            type="search"
                            list="blogCategoryNames"
                            className="form-control"
                            placeholder="Ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <datalist id="blogCategoryNames">
                            {blogCategoryApiListData.map((cat) => (
                                <option key={cat.categoryId} value={cat.categoryName}/>
                            ))}
                        </datalist>
                    </div>

                    {/*FILTER*/}
                    <div className="col-md-3">
                        <label className="form-label fw-semibold">Sayfa başına kayıt</label>
                        <select
                            className="form-select"
                            value={pageSize}
                            onChange={(e) => setPageSize(Number(e.target.value))}
                        >
                            <option value={5}>5</option>
                            <option value={7}>7</option>
                            <option value={10}>10</option>
                            <option value={15}>15</option>
                            <option value={25}>25</option>
                        </select>
                    </div>

                    {/*TOPLAM KAYIT*/}
                    <div className="col-md-5 text-md-end">
                        <label className="form-label d-block fw-semibold">Toplam Kayıt</label>
                        <div className="d-flex justify-content-md-end align-items-center gap-3">
                            <span className="badge bg-secondary">{totalItems} kayıt</span>
                            <button className="btn btn-primary" type="button" onClick={openCreateModal}>
                                <i className="fa-solid fa-plus me-1"/>
                                {t('create')}
                            </button>
                        </div>
                    </div>
                </div>
                {' '}
                {/* row */}
            </div>

            {/*ALERT ERROR*/}
            {error && <div className="alert alert-danger mt-0 mb-0 py-2 px-3 text-center">{error}</div>}

            {/*LOADING ERROR*/}
            {loading ? (
                <div className="text-center my-5">
                    <div className="spinner-border" role="status"/>
                </div>
            ) : (
                <div className="table-responsive mt-3 container animate__animated animate__fadeInUp">
                    {pageData.length === 0 ? (
                        <div className="alert alert-warning">Filtreye uygun sonuç bulunamadı.</div>
                    ) : (
                        <table
                            className="table table-striped table-dark table-bordered mb-4 align-middle"
                            style={{borderRadius: '0.75rem', overflow: 'hidden'}}
                        >
                            <thead>
                            <tr>
                                <th scope="col">{t('id')}</th>
                                <th scope="col">{t('blog_category_name')}</th>
                                <th scope="col">{t('date')}</th>
                                <th scope="col">{t('update')}</th>
                                <th scope="col">{t('show')}</th>
                                <th scope="col">{t('delete')}</th>
                            </tr>
                            </thead>
                            <tbody>
                            {pageData.map((data) => (
                                <tr key={data.categoryId}>
                                    <td>{data.categoryId}</td>
                                    <td>{data.categoryName}</td>
                                    <td>{data.systemCreatedDate}</td>

                                    <td>
                                        <button
                                            type="button"
                                            className="btn btn-outline-light btn-sm"
                                            onClick={() => openEditModal(data)}
                                        >
                                            <i className="fa-solid fa-wrench"/>
                                        </button>
                                    </td>

                                    <td>
                                        <button
                                            type="button"
                                            className="btn btn-outline-light btn-sm"
                                            onClick={() => openShowModal(data)}
                                        >
                                            <i className="fa-solid fa-eye"/>
                                        </button>
                                    </td>

                                    <td>
                                        <button
                                            type="button"
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={() => handleDelete(data)}
                                        >
                                            <i className="fa-solid fa-trash-can"/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}

                    {/*PAGINATION /PAGE*/}
                    {totalItems > 0 && (
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
                            <div className="small text-muted">
                                Sayfa {currentPage} / {totalPages}
                            </div>
                            <nav>
                                <ul className="pagination pagination-sm mb-0">
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={() => goToPage(1)}>
                                            «
                                        </button>
                                    </li>
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={() => goToPage(currentPage - 1)}>
                                            ‹
                                        </button>
                                    </li>

                                    {getPageNumbers().map((page) => (
                                        <li key={page} className={`page-item ${page === currentPage ? 'active' : ''}`}>
                                            <button className="page-link" onClick={() => goToPage(page)}>
                                                {page}
                                            </button>
                                        </li>
                                    ))}

                                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={() => goToPage(currentPage + 1)}>
                                            ›
                                        </button>
                                    </li>
                                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={() => goToPage(totalPages)}>
                                            »
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    )}
                </div>
            )}

            {/* MODAL */}
            {isModalOpen && (
                <div
                    className="modal fade show d-block"
                    tabIndex="-1"
                    role="dialog"
                    style={{backgroundColor: 'rgba(0,0,0,0.5)'}}
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content animate__animated animate__zoomIn">
                            <div className="modal-header">
                                <h5 className="modal-title">{getModalTitle()}</h5>
                                <button type="button" className="btn-close" onClick={closeModal}/>
                            </div>
                            <div className="modal-body">{renderModalBody()}</div>

                            {modalMode === 'show' && (
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                        Kapat
                                    </button>
                                    {selectedCategory && (
                                        <button
                                            type="button"
                                            className="btn btn-warning"
                                            onClick={() => openEditModal(selectedCategory)}
                                        >
                                            <i className="fa-solid fa-wrench me-1"/>
                                            {t('update')}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </React.Fragment>
    );
}

// HOC Default
export default withTranslation()(BlogCategoryManagement);
