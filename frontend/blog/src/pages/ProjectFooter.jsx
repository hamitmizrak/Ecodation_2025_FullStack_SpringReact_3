// rfce
import React from 'react';

// pictures
import Coffee from '../shared/assets/images/coffee.jpg';

function ProjectFooter() {
  return (
    <React.Fragment>

        {/* start  Footer */}
        <footer id="footer_id" className="pt-5">
          <div className="footer-container container">
            <div className="row">
              {/* 1. Sütun: Logo + Hakkında + Abone Ol */}
              <div className="col-md-4 mb-4">
                <h5 className="mt-3">Abone Ol</h5>
                <img id="footer-logo" src={Coffee} alt="xyz.inc" className="mb-3" />
                <p className="footer-company-text">
                  Yenilikçi teknoloji çözümleri ile sektörde öncü
                </p>
                <form className="subscribe-form">
                  <div className="input-group">
                    <input
                      type="email"
                      className="form-control"
                      placeholder="E-mail adresiniz"
                      required=""
                    />
                    <button type="submit" className="btn btn-primary">
                      Gönder
                    </button>
                  </div>
                </form>
              </div>
              {/* 2. Sütun: İletişim Formu */}
              <div className="col-md-4 mb-4">
                <h5>İletişim</h5>
                <form id="contactForm" className="contact-form">
                  <div className="mb-2">
                    <input
                      type="text"
                      id="contactName"
                      className="form-control"
                      placeholder="Ad Soyad"
                      required=""
                    />
                  </div>
                  <div className="mb-2">
                    <input
                      type="email"
                      id="contactEmail"
                      className="form-control"
                      placeholder="E-posta"
                      required=""
                    />
                  </div>
                  <div className="mb-2">
                    <textarea
                      id="contactMessage"
                      className="form-control"
                      rows={3}
                      placeholder="Mesajınız"
                      required=""
                      defaultValue={''}
                    />
                  </div>
                  <button type="submit" className="btn btn-warning w-100">
                    Gönder
                  </button>
                </form>
              </div>
              {/* 3. Sütun: Linkler + Sosyal */}
              <div className="col-md-4 mb-4">
                <h5>Yararlı Linkler</h5>
                <ul className="footer-link list-unstyled">
                  <li>
                    <a href="#scroll_spy_works">Çalışmalar</a>
                  </li>
                  <li>
                    <a href="#scroll_spy_success_rate">Başarılarımız</a>
                  </li>
                  <li>
                    <a href="#newspaper">Haberler</a>
                  </li>
                  <li>
                    <a href="#about">Hakkımızda</a>
                  </li>
                  <li>
                    <a href="#blog">Blog</a>
                  </li>
                  <li>
                    <a href="#maps">İletişim</a>
                  </li>
                </ul>
                <div className="social-icons mt-3">
                  <a href="#">
                    <i className="fa-brands fa-linkedin" />
                  </a>
                  <a href="#">
                    <i className="fa-brands fa-github" />
                  </a>
                  <a href="#">
                    <i className="fa-brands fa-instagram" />
                  </a>
                </div>
              </div>
            </div>
          </div>
          {/* Alt Kısım */}
          <div className="footer-bottom text-center py-3">
            2023-
            <span id="footer_year" />
          </div>
        </footer>
        {/* end  Footer */}
        {/* start  backtotop */}
        <a id="back_top_id" href="#back_top_span">
          <i className="fa-regular fa-circle-up" />
        </a>
        {/* end  backtotop */}
        {/* end code */}
    </React.Fragment>
  );
}

export default ProjectFooter;
