// src/store/store.js

/**
 * Redux Store Tanımı
 * --------------------------------------------------
 * Uygulamanın global state'ini yöneten merkezi store.
 * configureStore (RTK): Otomatik olarak Redux devtools, thunk middleware ve daha fazlasını içerir.
 *
 * Burada tüm slice'lar "reducer" nesnesine eklenir.
 * (auth dışında başka modüller geldikçe eklemen yeterli: blogCategory, blog, vs.)
 */

// RTK'nın configureStore fonksiyonu (Redux store'u kolayca kurar)
import { configureStore } from '@reduxjs/toolkit';

// Auth slice (giriş/kayıt/yetki) için reducer
import authReducer from '../../features/auth/authSlice'; // DİKKAT: yolunu doğru ayarla! (kökten başlıyorsa '../features/auth/authSlice')

// Store oluşturuluyor
export const store = configureStore({
  reducer: {
    // Redux state: { auth: ... }
    auth: authReducer,
    // İleride başka slice'lar: blog: blogReducer, blogCategory: blogCategoryReducer, ...
  },
});

// NOT: Eğer başka dosyada default export isterseniz aşağıdaki satırı açın:
// export default store;
