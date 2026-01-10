// src/api/authService.js

import { axiosClient } from '../../lib/axiosClient'; // axios instance (Authorization header'ı burada setlenir)
import { ENDPOINTS } from '../../config/api'; // API yol tanımları

/**
 * Kullanıcı girişi için API isteği
 * ----------------------------------------------------------------
 * @param {string} email    - Kullanıcının e-posta adresi
 * @param {string} password - Kullanıcının şifresi
 * @returns {Promise}       - Axios promise döner; backend cevap olarak JWT token ve user bilgisi döndürmelidir.
 *
 * NOT: Eğer backend'de alan isimleri farklıysa (ör. "userName" vs "email") burada map et.
 */
export async function loginApi(email, password) {
  // axiosClient ile POST isteği (endpoint + body)
  return axiosClient.post(ENDPOINTS.LOGIN, { email, password });
}

/**
 * /me endpoint'i ile oturum açan kullanıcının profil bilgisi alınır
 * -----------------------------------------------------------------
 * Backend JWT doğrulamasına göre, header'daki token ile profil bilgisini döndürür.
 * Authorization header axiosClient üzerinden otomatik gönderilir.
 *
 * @returns {Promise}       - Axios promise (backend cevabına göre { user, ... } döner)
 */
export function fetchMe() {
  // axiosClient ile GET isteği
  return axiosClient.get(ENDPOINTS.ME);
}

// Kullanım örneği:
// const { data } = await loginApi(email, password);
// const { data } = await fetchMe();
