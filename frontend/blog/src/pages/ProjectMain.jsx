// rfce

// ProjectMain.jsx — FINAL
// İstediğin statik blog grid markup’ına birebir uyar (col-md-3 kartlar),
// ama veriler DB’den gelir. Özellikler korunur:
// - Hakkımızda: DB’den çek, resim + metin (fallback’lı)
// - Blog: DB’den çek; SOLDa kategori filtresi (DB’den), SAĞ tarafta senin verdiğin grid
// - Arama, sıralama, sayfalama
// - Görseller relative ise IMAGE_BASE ile çözülür, hata durumunda placeholder
// - Hata bildirimi için toastHelper kullanır

import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

// Config
import { API_BASE, ENDPOINTS, IMAGE_BASE } from '../config/api';

// Toast (projende farklı yolda olabilir; mevcut yapına göre güncelle)
import { showError, showSuccess } from '../areas/admin/resuability/toastHelper';

// Görsel fallback (About resmi bulunamazsa)
import AboutFallback from '../shared/assets/images/about.jpg';

// ---------------- Helpers ----------------
const extractData = (res) => {
  const d = res?.data;
  // ApiResult, Spring Page veya düz array olabilir
  return d?.data ?? d?.result ?? d?.items ?? d?.content ?? d ?? [];
};

const resolveImageUrl = (src) =>
  !src
    ? ''
    : /^https?:\/\//i.test(src)
    ? src
    : `${IMAGE_BASE}${src.startsWith('/') ? src : '/' + src}`;

const fmtDate = (iso) =>
  !iso
    ? ''
    : new Date(iso).toLocaleDateString('tr-TR', {
        timeZone: 'Europe/Istanbul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });

const excerpt = (text = '', max = 1200) => {
  // line-clamp6 ile görsel kısaltma CSS’te yapılacak, yine de güvenlik için JS tarafında da limitle
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  return t.length <= max ? t : t.slice(0, max - 1) + '…';
};

 function ProjectMain() {
  // ====== ABOUT ======
  const [about, setAbout] = useState(null);
  const [aboutLoading, setAboutLoading] = useState(false);

  // ====== BLOGS / CATEGORIES ======
  const [blogs, setBlogs] = useState([]);
  const [blogLoading, setBlogLoading] = useState(false);

  const [cats, setCats] = useState([]);
  const [catLoading, setCatLoading] = useState(false);

  // ====== FILTERS / SORT / PAGE ======
  const [activeCatId, setActiveCatId] = useState(''); // '' => tümü
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState('systemCreatedDate'); // systemCreatedDate|title|header
  const [sortDir, setSortDir] = useState('desc'); // asc|desc

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8); // grid 4x2 gibi

  // INITIAL FETCH
  useEffect(() => {
    fetchAbout();
    fetchCategories();
    fetchBlogs();
  }, []);

  // ====== FETCHERS ======
  const fetchAbout = async () => {
    setAboutLoading(true);
    try {
      const res = await axios.get(`${API_BASE}${ENDPOINTS.ABOUT.LIST}`);
      const data = extractData(res);
      const arr = Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : [];
      // Genelde tek kayıt — yoksa ilkini al
      setAbout(arr?.[0] || null);
    } catch (e) {
      showError?.('Hakkımızda bilgisi yüklenemedi.') ?? console.error(e);
    } finally {
      setAboutLoading(false);
    }
  };

  const fetchCategories = async () => {
    setCatLoading(true);
    try {
      const res = await axios.get(`${API_BASE}${ENDPOINTS.BLOG_CATEGORY.LIST}`);
      const data = extractData(res);
      const arr = Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : [];
      setCats(arr);
    } catch (e) {
      showError?.('Blog kategorileri yüklenemedi.') ?? console.error(e);
    } finally {
      setCatLoading(false);
    }
  };

  const fetchBlogs = async () => {
    setBlogLoading(true);
    try {
      const res = await axios.get(`${API_BASE}${ENDPOINTS.BLOG.LIST}`);
      const data = extractData(res);
      const arr = Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : [];
      // En yeni üste
      const sorted = [...arr].sort(
        (a, b) => new Date(b.systemCreatedDate || 0) - new Date(a.systemCreatedDate || 0)
      );
      setBlogs(sorted);
    } catch (e) {
      showError?.('Bloglar yüklenemedi.') ?? console.error(e);
    } finally {
      setBlogLoading(false);
    }
  };

  // ====== DERIVED: category counts ======
  const catCounts = useMemo(() => {
    const map = new Map();
    for (const b of blogs || []) {
      const id = b?.blogCategoryDto?.categoryId ?? b?.blogCategoryDto?.id ?? null;
      if (!id) continue;
      map.set(id, (map.get(id) || 0) + 1);
    }
    return map; // Map<categoryId, count>
  }, [blogs]);

  // ====== FILTERED / SORTED / PAGED BLOGS ======
  const filtered = useMemo(() => {
    let arr = [...(blogs || [])];

    // kategori filtresi
    if (activeCatId) {
      const cid = Number(activeCatId);
      arr = arr.filter((b) => (b?.blogCategoryDto?.categoryId ?? b?.blogCategoryDto?.id) === cid);
    }

    // arama
    const q = query.trim().toLowerCase();
    if (q) {
      arr = arr.filter((b) => {
        const id = String(b?.blogId ?? b?.id ?? '');
        const header = String(b?.header ?? '').toLowerCase();
        const title = String(b?.title ?? '').toLowerCase();
        const content = String(b?.content ?? '').toLowerCase();
        const catName = String(b?.blogCategoryDto?.categoryName ?? '').toLowerCase();
        return (
          id.includes(q) ||
          header.includes(q) ||
          title.includes(q) ||
          content.includes(q) ||
          catName.includes(q)
        );
      });
    }

    return arr;
  }, [blogs, activeCatId, query]);

  const sortedBlogs = useMemo(() => {
    const arr = [...filtered];
    const getVal = (b) => {
      switch (sortKey) {
        case 'title':
          return String(b?.title ?? '').toLowerCase();
        case 'header':
          return String(b?.header ?? '').toLowerCase();
        case 'systemCreatedDate':
        default:
          return new Date(b?.systemCreatedDate || 0).getTime();
      }
    };
    arr.sort((a, b) => {
      const va = getVal(a);
      const vb = getVal(b);
      const r = va < vb ? -1 : va > vb ? 1 : 0;
      return sortDir === 'asc' ? r : -r;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const total = sortedBlogs.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, pageCount);

  const paged = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedBlogs.slice(start, start + pageSize);
  }, [sortedBlogs, currentPage, pageSize]);

  // ====== UI HELPERS ======
  const aboutImg = resolveImageUrl(about?.image || about?.imageUrl || '') || AboutFallback;
  const aboutTitle = about?.title || about?.header || 'Hakkımızda';
  const aboutText =
    about?.content ||
    about?.about ||
    about?.description ||
    'Kurumumuz; yazılım ve danışmanlık alanlarında yenilikçi çözümler üretir.';

  const onChooseCat = (id) => {
    setActiveCatId(String(id || ''));
    setPage(1);
  };

  const onImgError = (e) => {
    e.currentTarget.src = 'https://via.placeholder.com/600x400?text=Blog';
  };

  return (
    <React.Fragment>
      <>
        {/* start  Main */}
        <main id="main_id">
          {/* Çalışmalar: Bootstrap özellikler */}
          <section
            id="scroll_spy_works"
            className="wow animate__animated animate__zoomIn"
            data-wow-delay="1.2s"
          >
            <div className="container">
              <div className="row justify-content-center g-4">
                <h3
                  className="customize_heading wow animate__animated animate__zoomIn"
                  data-wow-delay="1s"
                >
                  Çalışmalarımız
                </h3>
                {/* 1.icon */}
                <div className="col-12 col-sm-12 col-md-6 col-lg-4 col-xl-3 text-center mt-4 mb-4 shadow-lg p-4">
                  <i className="fa-solid fa-cart-shopping fa-4x text-primary" />
                  <h4 className="text-warning text-uppercase fw-bolder mt-4 mb-2">E-Ticaret</h4>
                  <p className="line-clamp4 text-capitalize">
                    E-Ticaret Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsum at,
                    fugit aliquam in similique quas, numquam odio et optio repudiandae quo dolore.
                    Eos, temporibus esse error atque animi ad unde! ti ratione magni eos beatae
                    cumque ut neque tenetur fugit iusto maiores. Labore, enim eaque!
                  </p>
                </div>
                {/* 2.icon */}
                <div className="col-12 col-sm-12 col-md-6 col-lg-4 col-xl-3 text-center mt-4 mb-4 shadow-lg p-4">
                  <i className="fa-solid fa-barcode fa-4x text-danger" />
                  <h4 className="text-warning text-uppercase fw-bolder mt-4 mb-2">Yazılım</h4>
                  <p className="line-clamp4 text-capitalize">
                    E-Ticaret Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsum at,
                    fugit aliquam in similique quas, numquam odio et optio repudiandae quo dolore.
                    Eos, temporibus esse error atque animi ad unde! ti ratione magni eos beatae
                    cumque ut neque tenetur fugit iusto maiores. Labore, enim eaque!
                  </p>
                </div>
                {/* 3.icon */}
                <div className="col-12 col-sm-12 col-md-6 col-lg-4 col-xl-3 text-center mt-4 mb-4 shadow-lg p-4">
                  <i className="fa-solid fa-gears fa-4x text-success" />
                  <h4 className="text-warning text-uppercase fw-bolder mt-4 mb-2">Danışmanlık</h4>
                  <p className="line-clamp4 text-capitalize">
                    E-Ticaret Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsum at,
                    fugit aliquam in similique quas, numquam odio et optio repudiandae quo dolore.
                    Eos, temporibus esse error atque animi ad unde! ti ratione magni eos beatae
                    cumque ut neque tenetur fugit iusto maiores. Labore, enim eaque!
                  </p>
                </div>
                {/* 4.icon */}
                <div className="col-12 col-sm-12 col-md-6 col-lg-4 col-xl-3 text-center mt-4 mb-4 shadow-lg p-4">
                  <i className="fa-solid fa-earth-americas fa-4x text-secondary" />
                  <h4 className="text-warning text-uppercase fw-bolder mt-4 mb-2">Web tasarım</h4>
                  <p className="line-clamp4 text-capitalize">
                    E-Ticaret Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsum at,
                    fugit aliquam in similique quas, numquam odio et optio repudiandae quo dolore.
                    Eos, temporibus esse error atque animi ad unde! ti ratione magni eos beatae
                    cumque ut neque tenetur fugit iusto maiores. Labore, enim eaque!
                  </p>
                </div>
              </div>
            </div>
          </section>
          {/* Başarılar (success_rate) */}
          {/* start section Başarılar */}
          <section
            id="success_rate"
            className="wow44 animate__animated animate__fadeIn"
            data-wow-delay="0.3s"
          >
            <div className="container">
              <div className="row">
                <h3
                  id="scroll_spy_success_rate"
                  className="customize_heading wow animate__animated animate__zoomIn"
                  data-wow-delay="1s"
                >
                  Başarılarımız
                </h3>
                {/* 1 */}
                <div className="col-md-4 col-lg-4 text-center">
                  <i className="fa-solid fa-check performance_icon text-warning fa-3x mb-3" />
                  <span className="counter text-white">250</span>
                  <p className="text-center">Çalışma Saati</p>
                </div>
                {/* 2 */}
                <div className="col-md-4 col-lg-4 text-center">
                  <i className="fa-solid fa-person-chalkboard performance_icon text-warning fa-3x mb-3" />
                  <span className="counter text-white">150</span>
                  <p className="text-center">Ekip Sayısı</p>
                </div>
                {/* 3 */}
                <div className="col-md-4 col-lg-4 text-center">
                  <i className="fa-brands fa-intercom performance_icon text-warning fa-3x mb-3" />
                  <span className="counter text-white">110</span>
                  <p className="text-center">Müşteri Sayısı</p>
                </div>
              </div>
            </div>
          </section>
          {/* Haberler  Start*/}
          <section
            id="scroll_spy_newspaper"
            className="wow animate__animated animate__fadeInLeft"
            data-wow-delay="1.4s"
          >
            <div className="container">
              <div className="row">
                <h3
                  className="customize_heading wow animate__animated animate__zoomIn"
                  data-wow-delay="1s"
                >
                  Yeni Haberler
                </h3>
                <p className="display-6 text-center">En Son Haber</p>
                <p className="line-clamp25">
                  Yeni Haberler Lorem ipsum dolor, sit amet consectetur adipisicing elit. Distinctio
                  similique beatae quis cupiditate voluptates, rerum explicabo! Distinctio amet,
                  nobis, vel eum fugit dolorem, incidunt sit id minus blanditiis odio doloribus.
                  Iusto ex reiciendis aliquam officiis officia voluptate optio harum, consectetur,
                  sint eos quam illum vel porro facilis! Ad quos veritatis eveniet. Quis odio ex
                  amet animi nesciunt quod nam itaque! Quae dolore reiciendis consequatur animi, nam
                  necessitatibus a eveniet beatae sequi deleniti eligendi, ipsum tempore, veritatis
                  blanditiis esse deserunt. Magnam minima sequi ad impedit quae enim necessitatibus
                  rerum magni numquam? Iusto pariatur iste optio impedit voluptatum, nisi, eius
                  maxime odit corporis ipsam, nulla sunt nemo laboriosam autem? Magni iusto corrupti
                  reiciendis explicabo, cum itaque illo vitae nisi? Ut, quos explicabo? Ratione hic
                  dicta consequuntur. Esse doloremque quisquam omnis quis error praesentium ullam
                  sunt, iste, sapiente voluptas laboriosam iure optio eum repellat tenetur nulla ea
                  eius? Placeat voluptatibus delectus consequatur perspiciatis! Repellat velit illum
                  natus ipsum minus, inventore asperiores nulla doloremque enim voluptate odio quis
                  sequi laborum? Debitis provident similique perferendis asperiores voluptatum
                  laudantium? Velit nisi delectus voluptatem tenetur alias voluptates? Obcaecati
                  odit ea placeat maxime. Facilis amet optio possimus est deserunt incidunt
                  voluptatem nobis fugit earum debitis quo ut cum, reprehenderit praesentium neque
                  temporibus delectus! Sunt praesentium distinctio vitae nostrum. Dolores quisquam
                  unde, laborum corrupti fuga expedita architecto optio eaque harum quos quibusdam
                  debitis aspernatur, excepturi, temporibus qui aliquam. Porro natus asperiores
                  officia adipisci iste eos provident culpa ab sed? Ab neque molestias nisi id?
                  Atque, iste nisi! Deserunt fugit eaque odio dicta laudantium natus animi sit
                  voluptatum dolor iure cumque aut consequuntur recusandae praesentium unde, nostrum
                  nisi eos! Ex? Fugiat ratione harum ea praesentium ipsa? Dolor voluptatum id amet
                  delectus! Deleniti atque ex necessitatibus illo accusantium voluptate beatae, eius
                  tempore, magnam consequatur, quos libero nostrum porro similique modi. Eveniet.
                  Aliquam, vel, pariatur quis minima, expedita officiis cumque neque tenetur placeat
                  autem unde dignissimos. Rem repellat in numquam quasi consequuntur fugiat ex sint
                  explicabo quas totam officiis, iure id commodi! Optio, quis incidunt provident
                  modi exercitationem perferendis numquam quia, libero cum quod consectetur
                  voluptatibus, non eligendi ipsa. Modi error perspiciatis adipisci obcaecati
                  tempora. Sint illum laudantium est in, velit aut. Rem molestiae tempore unde, iure
                  officiis accusamus alias voluptate vel! Eum debitis ea praesentium totam eius
                  atque, molestias veritatis vitae aut sequi, adipisci nam fuga? Dolore omnis earum
                  esse nostrum? Deserunt modi pariatur itaque doloribus magnam minus quod tempora
                  architecto, odio velit laboriosam possimus voluptates cupiditate expedita
                  praesentium numquam sunt officia fuga, sed dignissimos dolore porro. Modi ipsum
                  totam a. Architecto iusto voluptatum modi non recusandae praesentium, consequuntur
                  cumque fugiat soluta deleniti? Molestiae beatae officia, minima dolorum expedita
                  magnam reprehenderit fugit, libero impedit qui ipsum quod iusto amet! Provident,
                  commodi. Ipsa expedita neque tempore reprehenderit, laboriosam sapiente quod quis
                  praesentium! Blanditiis, velit odit. Quidem voluptatem error reprehenderit alias
                  magni consequatur labore nostrum dolores omnis aut praesentium vitae maiores, eos
                  vel! Id fugit itaque veniam vel praesentium sint maxime doloribus aspernatur in
                  aperiam, voluptas consectetur delectus harum nisi repellendus nihil totam
                  quibusdam incidunt odio quasi vitae cupiditate voluptatibus explicabo asperiores.
                  Unde! Qui laborum nulla labore, officia sint maiores minus illo tempora alias
                  incidunt amet nihil dolorum vitae tenetur excepturi veniam ad! Animi et doloremque
                  error nulla explicabo harum dicta, fuga consequatur. Laudantium dolores
                  perspiciatis hic voluptatem vero nesciunt, reiciendis sequi accusamus nam ea, quod
                  vel dolor facilis officia non eum corporis suscipit minus cumque numquam. Id non
                  quae porro eos! In! Debitis fugit corporis minima reiciendis, sunt nobis deleniti
                  officia rerum, sit atque nemo laborum beatae asperiores minus illo quas. Laborum
                  aspernatur aut debitis est quae minima animi earum fugit incidunt!
                </p>
              </div>
            </div>
          </section>
          {/* Haberler  End*/}

          {/* MAIN */}
          {/* ================== HAKKIMIZDA ================== */}

          {/* ================== HAKKIMIZDA ================== */}
          <section
            id="scroll_spy_about"
            className="wow animate__animated animate__fadeInRight"
            data-wow-delay="0.2s"
          >
            <div className="about-overlay" />
            <div className="container position-relative">
              <div className="row align-items-center">
                <h3
                  className="customize_heading wow animate__animated animate__zoomIn"
                  data-wow-delay="0.1s"
                >
                  Hakkımızda
                </h3>

                {/* Sol: Görsel */}
                <div className="col-12 col-lg-6 mb-4 text-center">
                  <img
                    id="about_picture"
                    src={aboutLoading ? AboutFallback : aboutImg}
                    alt={aboutTitle}
                    loading="lazy"
                    className="img-glare"
                    style={{ maxWidth: '100%', borderRadius: 10 }}
                  />
                  <p className="mt-3 text-light small">
                    {aboutLoading
                      ? 'Yükleniyor…'
                      : about?.subtitle || 'Yenilikçi teknoloji çözümleri'}
                  </p>
                </div>

                {/* Sağ: Yazı */}
                <div className="col-12 col-lg-6">
                  <div className="about-text p-4 p-lg-5 bg-dark bg-opacity-25 rounded-4">
                    <h4 className="mb-3">{aboutTitle}</h4>
                    <p style={{ whiteSpace: 'pre-wrap' }}>
                      {aboutLoading ? 'Hakkımızda metni yükleniyor…' : aboutText}
                    </p>
                    {about?.mission && (
                      <p className="mb-1">
                        <strong>Misyon:</strong> {about.mission}
                      </p>
                    )}
                    {about?.vision && (
                      <p className="mb-0">
                        <strong>Vizyon:</strong> {about.vision}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* About End*/}
          {/* Blog  Start*/}
          {/* start section blog */}
          <h3
            id="scroll_spy_blog"
            className="customize_heading wow animate__animated animate__zoomIn"
            data-wow-delay="1s"
          >
            Blog
          </h3>
          <p className="display-6 text-center">Yeni Blog</p>
          {/* ================== BLOG ================== */}
          {/* Üst başlık/filtre bar (isteğe bağlı) */}
          <h3
            id="scroll_spy_blog"
            className="customize_heading wow animate__animated animate__zoomIn"
            data-wow-delay="1s"
          >
            Blog
          </h3>
          <p className="display-6 text-center">Yeni Blog</p>

          <section id="blog" className="wow fadeIn">
            <div className="container">
              <div className="row g-4">
                {/* ====== SOL: KATEGORİLER (DB'den) ====== */}
                <aside className="col-12 col-lg-3">
                  <div className="card shadow-sm">
                    <div className="card-header d-flex align-items-center justify-content-between">
                      <strong>Kategoriler</strong>
                      {catLoading && <span className="spinner-border spinner-border-sm" />}
                    </div>
                    <ul className="list-group list-group-flush">
                      <li
                        className={`list-group-item d-flex justify-content-between align-items-center ${
                          !activeCatId ? 'active' : ''
                        }`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => onChooseCat('')}
                      >
                        Tümü
                        <span className="badge bg-light text-dark rounded-pill">
                          {blogs.length}
                        </span>
                      </li>
                      {cats.map((c) => {
                        const id = c?.categoryId ?? c?.id;
                        const count = catCounts.get(id) || 0;
                        return (
                          <li
                            key={id}
                            className={`list-group-item d-flex justify-content-between align-items-center ${
                              String(activeCatId) === String(id) ? 'active' : ''
                            }`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => onChooseCat(id)}
                            title={c?.categoryName}
                          >
                            <span className="text-truncate" style={{ maxWidth: 140 }}>
                              {c?.categoryName}
                            </span>
                            <span className="badge bg-light text-dark rounded-pill">{count}</span>
                          </li>
                        );
                      })}
                      {cats.length === 0 && !catLoading && (
                        <li className="list-group-item text-muted">Kategori yok</li>
                      )}
                    </ul>

                    {/* Arama / Sıralama / Sayfa boyutu küçük panel */}
                    <div className="card-body border-top">
                      <div className="mb-2">
                        <input
                          className="form-control"
                          placeholder="Ara (başlık / içerik)"
                          value={query}
                          onChange={(e) => {
                            setQuery(e.target.value);
                            setPage(1);
                          }}
                        />
                      </div>
                      <div className="d-flex gap-2">
                        <select
                          className="form-select"
                          value={sortKey}
                          onChange={(e) => setSortKey(e.target.value)}
                          title="Sırala"
                        >
                          <option value="systemCreatedDate">Tarih</option>
                          <option value="title">Başlık</option>
                          <option value="header">Header</option>
                        </select>
                        <button
                          className="btn btn-outline-secondary w-100"
                          onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
                          title="Yön"
                          type="button"
                        >
                          {sortDir === 'asc' ? '▲ artan' : '▼ azalan'}
                        </button>
                      </div>
                      <div className="mt-2">
                        <select
                          className="form-select"
                          value={pageSize}
                          onChange={(e) => {
                            setPageSize(parseInt(e.target.value || '8', 10));
                            setPage(1);
                          }}
                          title="Sayfa boyutu"
                        >
                          {[4, 8, 12, 16].map((n) => (
                            <option key={n} value={n}>
                              {n}/sayfa
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </aside>

                {/* ====== SAĞ: BLOG GRID (senin markup) ====== */}
                <div className="col-12 col-lg-9">
                  <div className="row">
                    {blogLoading ? (
                      // Skeleton kartlar
                      Array.from({ length: pageSize }).map((_, i) => (
                        <div key={`s-${i}`} className="col-md-3 img-glare mb-4">
                          <div className="card">
                            <div className="ratio ratio-16x9 bg-light" />
                            <div className="card-body">
                              <div className="placeholder-glow mb-2">
                                <span className="placeholder col-8" />
                              </div>
                              <div className="placeholder-glow">
                                <span className="placeholder col-12" />
                                <span className="placeholder col-11" />
                                <span className="placeholder col-10" />
                              </div>
                              <span className="blog_date d-inline-block mt-2 text-muted">
                                —/—/----
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : paged.length === 0 ? (
                      <div className="col-12">
                        <div className="alert alert-light mb-0">Gösterilecek blog bulunamadı.</div>
                      </div>
                    ) : (
                      paged.map((b) => {
                        const id = b?.blogId ?? b?.id;
                        const title = b?.title ?? '—';
                        const img = resolveImageUrl(b?.image || b?.imageUrl || '');
                        const text = excerpt(b?.content, 1200);
                        const dateStr = fmtDate(b?.systemCreatedDate);

                        return (
                          <div key={id} className="col-md-3 img-glare">
                            <div className="card mb-4">
                              <a href="#">
                                <img
                                  className="card-img-top"
                                  src={img || 'https://via.placeholder.com/600x400?text=Blog'}
                                  alt={title}
                                  onError={onImgError}
                                  loading="lazy"
                                />
                              </a>
                              <div className="card-body">
                                <h4 className="card-title">{title}</h4>
                                <p className="card-text line-clamp6">{text}</p>
                                {/* SAĞDA TARİH yerine, verdiğin markup’taki gibi altta tarih */}
                                <span className="blog_date">{dateStr || '—/—/----'}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Pagination */}
                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <div>
                      Toplam <b>{total}</b> sonuç — Sayfa <b>{currentPage}</b>/<b>{pageCount}</b>
                    </div>
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
                {/* /col-lg-9 */}
              </div>
            </div>
          </section>

          {/* end section blog */}
          {/* İletişim  Start*/}
          {/* start section maps */}
          <section id="maps" className="wow fadeIn">
            <h3
              id="scroll_spy_blog"
              className="customize_heading wow animate__animated animate__zoomIn"
              data-wow-delay="1s"
            >
              Maps
            </h3>
            {/* https://www.embedmap.net/ */}
            <iframe
              frameBorder={0}
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              id="gmap_canvas"
              src="https://maps.google.com/maps?width=985&height=551&hl=en&q=%20malatya+()&t=&z=12&ie=UTF8&iwloc=B&output=embed"
            />
          </section>
          {/* end section contact */}
        </main>
        {/* end  Main */}
      </>
    </React.Fragment>
  );
}

export default ProjectMain;
