// src/index.js  (CRA için ana giriş noktası)

// React ve root render fonksiyonu (React 18+ ile 'react-dom/client')
import React from 'react';
import ReactDOM from 'react-dom/client';

// UI Framework ve animasyon kütüphaneleri (sıralama önemli olabilir)
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap ana CSS
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Bootstrap JS (modal, tooltip vs.)
import '@fortawesome/fontawesome-free/css/all.min.css'; // FontAwesome ikonlar
import 'animate.css/animate.min.css'; // Animate.css animasyonları

// Export index.css
import './app/index.css'; // Projenizin kendi global css’i

// Redux store'u global olarak sağlamak için Provider
import { Provider } from 'react-redux';
import { store } from './app/store/store'; // Redux store (dizine göre yolunu kontrol et!)

// React Router (SPA için sayfa yönlendirme)
// BrowserRouter: HTML5 history API kullanır (modern tarayıcılar için)
// HashRouter: URL hash (#) kullanır (eski tarayıcılar için, SEO için değil)
import { BrowserRouter } from 'react-router-dom'; // Router context'i
import Router from './routes/router';

// Toast ana index.js eklenmesi gerekiyor
import ReusabilityToast from "./areas/admin/resuability/ReusabilityToast";// Ana router component’iniz (Routes tanımlarınız burada)

// Root element (public/index.html’de id="root" olan div’e render eder)
const root = ReactDOM.createRoot(document.getElementById('root'));

// Uygulamanın ana render’ı
root.render(
  <Provider store={store}>
    {' '}
    {/* Redux context (store tüm alt komponentlere ulaşır) */}
    <BrowserRouter>
        <ReusabilityToast/>
        {' '}
      {/* Router context (url değişimini yönetir) */}
      <Router /> {/* Sizin ana Routes component’iniz */}
    </BrowserRouter>
  </Provider>
);

// NOTLAR:
// - Sadece tek Provider ve tek BrowserRouter olmalı; tüm app bunun içinde olmalı!
// - UI kitlerin CSS/JS import sırası bazen önemli olabilir (önce CSS, sonra JS).
// - Eğer 'store' default export ise 'import store from...' ile çağırmalısınız.
