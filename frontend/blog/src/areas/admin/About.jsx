import React, { useEffect, useState } from "react";
import axios from "axios";
import ResuabilityToast from "./resuability/ReusabilityToast";          // yolu projene göre düzenle
import { showSuccess, showError } from "./resuability/toastHelper";     // yolu projene göre düzenle
import { API_BASE, ENDPOINTS, IMAGE_BASE } from "../../config/api";

// Görsel yolu çözücü
// Yardımcılar
const resolveImageUrl = (src) =>
    !src ? "" : /^https?:\/\//i.test(src) ? src : `${IMAGE_BASE}${src.startsWith("/") ? src : "/" + src}`;

// Tarih formatı
const formatDate = (iso) =>
    !iso ? "" : new Date(iso).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" });

// Tek Backdrop (global)
function GlobalBackdrop({ show, onClose }) {
    if (!show) return null;
    return (
        <div
            className="modal-backdrop fade show"
            style={{ zIndex: 1040 }}
            onClick={onClose ?? undefined}
        />
    );
}

export default function About() {
    // Liste
    const [abouts, setAbouts] = useState([]);

    // Modal state’leri
    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showView, setShowView] = useState(false);
    const [showDelete, setShowDelete] = useState(false);

    // Seçili kayıt ve form
    const [selectedAbout, setSelectedAbout] = useState(null);
    const [form, setForm] = useState({
        aboutName: "",
        mission: "",
        vision: "",
        imageUrl: "",
        imageFile: null,
    });

    // Hata & loading
    const [formError, setFormError] = useState({});
    const [spinner, setSpinner] = useState(false);
    // Modal
    const anyOpen = showCreate || showEdit || showView || showDelete;

    // Body sınıfı (modal-open) yönetimi
    useEffect(() => {
        if (anyOpen) document.body.classList.add("modal-open");
        else document.body.classList.remove("modal-open");
        return () => document.body.classList.remove("modal-open");
    }, [anyOpen]);

    // ESC ile kapat
    useEffect(() => {
        const onKey = (e) => {
            if (e.key !== "Escape") return;
            if (showCreate) return closeCreateModal();
            if (showEdit) return closeEditModal();
            if (showView) return closeViewModal();
            if (showDelete) return closeDeleteModal();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [showCreate, showEdit, showView, showDelete]);

    // Listeyi çek
    const fetchAbouts = async () => {
        try {
            const res = await axios.get(`${API_BASE}${ENDPOINTS.ABOUT.LIST}`);
            const data =
                res?.data?.data ??
                res?.data?.result ??
                res?.data?.items ??
                res?.data?.content ??
                res?.data ??
                [];
            setAbouts(Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : []);
        } catch {
            showError("Hakkımızda listesi yüklenemedi");
        }
    };
    useEffect(() => { fetchAbouts(); }, []);

    // Form değişimi
    const handleFormChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "imageFile") {
            setForm((p) => ({ ...p, imageFile: files?.[0] ?? null }));
        } else {
            setForm((p) => ({ ...p, [name]: value }));
        }
        setFormError((p) => ({ ...p, [name]: undefined }));
    };

    // Modal yardımcıları
    const resetForm = () =>
        setForm({ aboutName: "", mission: "", vision: "", imageUrl: "", imageFile: null });

    const closeAllModals = () => {
        setShowCreate(false);
        setShowEdit(false);
        setShowView(false);
        setShowDelete(false);
    };

    // Aç/Kapat
    const openCreateModal = () => {
        closeAllModals();
        resetForm();
        setFormError({});
        setShowCreate(true);
    };
    const closeCreateModal = () => {
        setShowCreate(false);
        setFormError({});
        resetForm();
    };

    // EDIT OPEN MODAL
    const openEditModal = (about) => {
        closeAllModals();
        setSelectedAbout(about);
        setForm({
            aboutName: about?.aboutName || "",
            mission: about?.mission || "",
            vision: about?.vision || "",
            imageUrl: about?.imageUrl || "",
            imageFile: null,
        });
        setFormError({});
        setShowEdit(true);
    };

    // EDIT CLOSE MODAL
    const closeEditModal = () => {
        setShowEdit(false);
        setFormError({});
        setSelectedAbout(null);
    };

    // VIEW OPEN MODAL
    const openViewModal = (about) => {
        closeAllModals();
        setSelectedAbout(about);
        setShowView(true);
    };

    // VIEW CLOSE MODAL
    const closeViewModal = () => {
        setShowView(false);
        setSelectedAbout(null);
    };

    // DELETE OPEN MODAL
    const openDeleteModal = (about) => {
        closeAllModals();
        setSelectedAbout(about);
        setShowDelete(true);
    };

    // DELETE CLOSE MODAL
    const closeDeleteModal = () => {
        setShowDelete(false);
        setSelectedAbout(null);
    };

    // CREATE
    const handleCreate = async (e) => {
        e.preventDefault();
        const err = {};
        if (!form.aboutName?.trim()) err.aboutName = "Hakkımızda Adı zorunlu";
        if (!form.mission?.trim()) err.mission = "Misyon zorunlu";
        if (!form.vision?.trim()) err.vision = "Vizyon zorunlu";
        setFormError(err);
        if (Object.keys(err).length > 0) return;

        // Spinner Aç
        setSpinner(true);
        try {
            const dto = {
                aboutName: form.aboutName.trim(),
                mission: form.mission.trim(),
                vision: form.vision.trim(),
                imageUrl: form.imageUrl || undefined,
            };

            let op;
            if (form.imageFile) {
                const fd = new FormData();
                fd.append("about", new Blob([JSON.stringify(dto)], { type: "application/json" }));
                fd.append("file", form.imageFile);
                op = axios.post(`${API_BASE}${ENDPOINTS.ABOUT.CREATE}`, fd, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            } else {
                op = axios.post(`${API_BASE}${ENDPOINTS.ABOUT.CREATE}`, dto);
            }

            await op;
            showSuccess("Kayıt başarıyla eklendi");
            closeCreateModal();
            fetchAbouts();
        } catch (ex) {
            showError(ex?.response?.data?.message || "Kayıt eklenemedi");
            setFormError(ex?.response?.data?.validationErrors || {});
        } finally {
            setSpinner(false);
        }
    };

    // UPDATE
    const handleEdit = async (e) => {
        e.preventDefault();
        const err = {};
        if (!form.aboutName?.trim()) err.aboutName = "Hakkımızda Adı zorunlu";
        if (!form.mission?.trim()) err.mission = "Misyon zorunlu";
        if (!form.vision?.trim()) err.vision = "Vizyon zorunlu";
        setFormError(err);
        if (Object.keys(err).length > 0) return;

        setSpinner(true);
        try {
            const id = selectedAbout?.aboutId ?? selectedAbout?.id;
            if (id == null) throw new Error("Güncellenecek kaydın ID bilgisi yok.");

            const dto = {
                aboutName: form.aboutName.trim(),
                mission: form.mission.trim(),
                vision: form.vision.trim(),
                imageUrl: form.imageUrl || undefined,
            };

            let op;
            if (form.imageFile) {
                const fd = new FormData();
                fd.append("about", new Blob([JSON.stringify(dto)], { type: "application/json" }));
                fd.append("file", form.imageFile);
                op = axios.put(`${API_BASE}${ENDPOINTS.ABOUT.UPDATE(id)}`, fd, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            } else {
                op = axios.put(`${API_BASE}${ENDPOINTS.ABOUT.UPDATE(id)}`, dto);
            }

            await op;
            showSuccess("Kayıt başarıyla güncellendi");
            closeEditModal();
            fetchAbouts();
        } catch (ex) {
            showError(ex?.response?.data?.message || ex?.message || "Kayıt güncellenemedi");
            setFormError(ex?.response?.data?.validationErrors || {});
        } finally {
            setSpinner(false);
        }
    };

    // DELETE
    const handleDelete = async () => {
        setSpinner(true);
        try {
            const id = selectedAbout?.aboutId ?? selectedAbout?.id;
            if (id == null) throw new Error("Silinecek kaydın ID bilgisi yok.");
            await axios.delete(`${API_BASE}${ENDPOINTS.ABOUT.DELETE(id)}`);
            showSuccess("Kayıt silindi!");
            closeDeleteModal();
            fetchAbouts();
        } catch (ex) {
            showError(ex?.response?.data?.message || ex?.message || "Kayıt silinemedi!");
        } finally {
            setSpinner(false);
        }
    };

    // render
    return (
        <>
            {/*Toast*/}
           {/* <ResuabilityToast />*/}

            <div className="container py-4">
                <h2 className="text-center mb-4">About / Hakkımızda Listesi</h2>

                <button className="btn btn-primary mb-3" onClick={openCreateModal}>
                    Yeni kayıt ekle
                </button>

                <div className="table-responsive">
                    <table className="table table-bordered table-striped align-middle">
                        <thead>
                        <tr>
                            <th style={{ width: 80 }}>ID</th>
                            <th>About Name</th>
                            <th>Misyon</th>
                            <th>Vizyon</th>
                            <th style={{ width: 120 }}>Görsel</th>
                            <th style={{ width: 160 }}>Oluşturma</th>
                            <th style={{ width: 130 }}>İşlem</th>
                        </tr>
                        </thead>
                        <tbody>
                        {abouts.length === 0 && (
                            <tr>
                                <td colSpan={7} className="text-center text-muted">
                                    Kayıt bulunamadı.
                                </td>
                            </tr>
                        )}
                        {abouts.map((row) => (
                            <tr key={row.aboutId || row.id}>
                                <td>{row.aboutId || row.id}</td>
                                <td>{row.aboutName}</td>
                                <td>{row.mission}</td>
                                <td>{row.vision}</td>
                                <td>
                                    {row.imageUrl ? (
                                        <img
                                            src={resolveImageUrl(row.imageUrl)}
                                            alt="about"
                                            style={{
                                                maxWidth: 100,
                                                maxHeight: 70,
                                                objectFit: "contain",
                                                borderRadius: 6,
                                                boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
                                            }}
                                        />
                                    ) : (
                                        <span className="text-muted small">RESİM YOK</span>
                                    )}
                                </td>
                                <td>{formatDate(row.systemCreatedDate)}</td>
                                <td>
                                    <div className="btn-group btn-group-sm">
                                        <button className="btn btn-outline-secondary" onClick={() => openViewModal(row)} title="Detay">
                                            <i className="fa fa-eye" />
                                        </button>
                                        <button className="btn btn-outline-primary" onClick={() => openEditModal(row)} title="Düzenle">
                                            <i className="fa fa-pen" />
                                        </button>
                                        <button className="btn btn-outline-danger" onClick={() => openDeleteModal(row)} title="Sil">
                                            <i className="fa fa-trash" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* CREATE MODAL */}
                {showCreate && (
                    <div
                        className="modal fade show d-block"
                        tabIndex={-1}
                        role="dialog"
                        style={{ zIndex: 1050 }}
                        onClick={closeCreateModal}                 // backdrop click
                    >
                        <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-content">
                                <form onSubmit={handleCreate} encType="multipart/form-data">
                                    <div className="modal-header">
                                        <h5 className="modal-title">Yeni Kayıt Ekle</h5>
                                        <button type="button" className="btn-close" onClick={closeCreateModal}></button>
                                    </div>
                                    <div className="modal-body">
                                        <div className="mb-3">
                                            <label className="form-label">About Name</label>
                                            <input
                                                type="text"
                                                className={`form-control ${formError.aboutName ? "is-invalid" : ""}`}
                                                name="aboutName"
                                                value={form.aboutName}
                                                onChange={handleFormChange}
                                                required
                                            />
                                            {formError.aboutName && <div className="invalid-feedback">{formError.aboutName}</div>}
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Misyon</label>
                                            <textarea
                                                className={`form-control ${formError.mission ? "is-invalid" : ""}`}
                                                name="mission"
                                                value={form.mission}
                                                onChange={handleFormChange}
                                                required
                                            />
                                            {formError.mission && <div className="invalid-feedback">{formError.mission}</div>}
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Vizyon</label>
                                            <textarea
                                                className={`form-control ${formError.vision ? "is-invalid" : ""}`}
                                                name="vision"
                                                value={form.vision}
                                                onChange={handleFormChange}
                                                required
                                            />
                                            {formError.vision && <div className="invalid-feedback">{formError.vision}</div>}
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Görsel</label>
                                            <input
                                                type="file"
                                                className="form-control"
                                                name="imageFile"
                                                onChange={handleFormChange}
                                                accept="image/*"
                                            />
                                            {form.imageFile && (
                                                <img
                                                    src={URL.createObjectURL(form.imageFile)}
                                                    alt="Önizleme"
                                                    className="mt-2 rounded"
                                                    style={{ maxHeight: 80, maxWidth: 140 }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={closeCreateModal}>
                                            Kapat
                                        </button>
                                        <button type="submit" className="btn btn-primary" disabled={spinner}>
                                            {spinner && <span className="spinner-border spinner-border-sm me-1"></span>}
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
                        onClick={closeEditModal}
                    >
                        <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-content">
                                <form onSubmit={handleEdit} encType="multipart/form-data">
                                    <div className="modal-header">
                                        <h5 className="modal-title">Kaydı Düzenle</h5>
                                        <button type="button" className="btn-close" onClick={closeEditModal}></button>
                                    </div>
                                    <div className="modal-body">
                                        <div className="mb-3">
                                            <label className="form-label">About Name</label>
                                            <input
                                                type="text"
                                                className={`form-control ${formError.aboutName ? "is-invalid" : ""}`}
                                                name="aboutName"
                                                value={form.aboutName}
                                                onChange={handleFormChange}
                                                required
                                            />
                                            {formError.aboutName && <div className="invalid-feedback">{formError.aboutName}</div>}
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Misyon</label>
                                            <textarea
                                                className={`form-control ${formError.mission ? "is-invalid" : ""}`}
                                                name="mission"
                                                value={form.mission}
                                                onChange={handleFormChange}
                                                required
                                            />
                                            {formError.mission && <div className="invalid-feedback">{formError.mission}</div>}
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Vizyon</label>
                                            <textarea
                                                className={`form-control ${formError.vision ? "is-invalid" : ""}`}
                                                name="vision"
                                                value={form.vision}
                                                onChange={handleFormChange}
                                                required
                                            />
                                            {formError.vision && <div className="invalid-feedback">{formError.vision}</div>}
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Görsel</label>
                                            <input
                                                type="file"
                                                className="form-control"
                                                name="imageFile"
                                                onChange={handleFormChange}
                                                accept="image/*"
                                            />
                                            {form.imageFile ? (
                                                <img
                                                    src={URL.createObjectURL(form.imageFile)}
                                                    alt="Önizleme"
                                                    className="mt-2 rounded"
                                                    style={{ maxHeight: 80, maxWidth: 140 }}
                                                />
                                            ) : (
                                                form.imageUrl && (
                                                    <img
                                                        src={resolveImageUrl(form.imageUrl)}
                                                        alt="Önceki"
                                                        className="mt-2 rounded"
                                                        style={{ maxHeight: 80, maxWidth: 140 }}
                                                    />
                                                )
                                            )}
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={closeEditModal}>
                                            Kapat
                                        </button>
                                        <button type="submit" className="btn btn-primary" disabled={spinner}>
                                            {spinner && <span className="spinner-border spinner-border-sm me-1"></span>}
                                            Kaydet
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* VIEW MODAL */}
                {showView && selectedAbout && (
                    <div
                        className="modal fade show d-block"
                        tabIndex={-1}
                        role="dialog"
                        style={{ zIndex: 1050 }}
                        onClick={closeViewModal}
                    >
                        <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Kayıt Detay</h5>
                                    <button type="button" className="btn-close" onClick={closeViewModal}></button>
                                </div>
                                <div className="modal-body">
                                    <div><strong>ID:</strong> {selectedAbout.aboutId || selectedAbout.id}</div>
                                    <div><strong>About Name:</strong> {selectedAbout.aboutName}</div>
                                    <div><strong>Misyon:</strong> {selectedAbout.mission}</div>
                                    <div><strong>Vizyon:</strong> {selectedAbout.vision}</div>
                                    <div><strong>Görsel:</strong><br />
                                        {selectedAbout.imageUrl ? (
                                            <img
                                                src={resolveImageUrl(selectedAbout.imageUrl)}
                                                alt="about"
                                                style={{ maxHeight: 100, maxWidth: 200, borderRadius: 8 }}
                                            />
                                        ) : <span className="text-muted small">RESİM YOK</span>}
                                    </div>
                                    <div><strong>Oluşturma:</strong> {formatDate(selectedAbout.systemCreatedDate)}</div>
                                </div>
                                <div className="modal-footer">
                                    <button className="btn btn-secondary" onClick={closeViewModal}>Kapat</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* DELETE MODAL */}
                {showDelete && selectedAbout && (
                    <div
                        className="modal fade show d-block"
                        tabIndex={-1}
                        role="dialog"
                        style={{ zIndex: 1050 }}
                        onClick={closeDeleteModal}
                    >
                        <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title text-danger">Silme Onayı</h5>
                                    <button type="button" className="btn-close" onClick={closeDeleteModal}></button>
                                </div>
                                <div className="modal-body">
                                    <div>
                                        <b>{selectedAbout.aboutName}</b> başlıklı kaydı silmek istediğinize emin misiniz?
                                    </div>
                                    <div className="mt-2 text-muted">
                                        <strong>ID:</strong> {selectedAbout.aboutId || selectedAbout.id}
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button className="btn btn-secondary" onClick={closeDeleteModal}>Vazgeç</button>
                                    <button className="btn btn-danger" onClick={handleDelete} disabled={spinner}>
                                        {spinner && <span className="spinner-border spinner-border-sm me-1"></span>}
                                        Sil
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TEK BACKDROP */}
                <GlobalBackdrop show={anyOpen} onClose={() => { /* sadece görsel katman; kapatma wrapper’da */ }} />
            </div>
        </>
    );
}
