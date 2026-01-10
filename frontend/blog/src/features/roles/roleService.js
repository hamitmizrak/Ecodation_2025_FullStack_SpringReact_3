// src/api/roleService.js

import { axiosClient } from './axiosClient'; // Ortak axios instance (Authorization header dahil)
import { ENDPOINTS } from '../config/api'; // API path'leri merkezi tanım

/**
 * Roller Listesi API Çağrısı
 * --------------------------------------------------------
 * Backend'den sistemdeki tüm rollerin listesini alır.
 * - GET isteği ile çağrılır.
 * - Parametre göndermek gerekirse { params: ... } şeklinde yollanır.
 * - Beklenen yanıt: [{id: 1, name: 'USER'}, ...] gibi bir dizi objedir.
 *
 * Backend'iniz farklı bir şema döndürüyorsa, burada map'leyerek normalize edebilirsiniz.
 *
 * @param {object} params  - (isteğe bağlı) Sorgu parametreleri (ör. filtre, sayfalama vs.)
 * @returns {Promise}      - Axios promise; data alanı genelde rollerin dizisidir.
 */
export function listRoles(params = {}) {
  // Eğer ENDPOINTS'de ROLES.LIST tanımlı değilse (örn. backend'de roller api yoksa), boş dizi dön.
  if (!ENDPOINTS?.ROLES?.LIST) {
    // endpoint yoksa promise rejection yerine resolve edilmiş boş data dönülür
    return Promise.resolve({ data: [] });
  }
  // Axios GET isteği ile roller alınır, params istenirse eklenir
  return axiosClient.get(ENDPOINTS.ROLES.LIST, { params });
}

// KULLANIM ÖRNEĞİ:
// const { data: roles } = await listRoles();
// roles -> örn. [{id: 1, name: 'ADMIN'}, {id: 2, name: 'USER'}]
