// src/api/blogCategoryService.js
import { axiosClient } from '../../lib/axiosClient';
import { ENDPOINTS } from '../../config/api';

// Liste (opsiyonel sayfalama parametreleri)
export function listBlogCategories(params = {}) {
  return axiosClient.get(ENDPOINTS.BLOG_CATEGORY.LIST, { params });
}

// Ekle
export function createBlogCategory(payload) {
  // payload: { name, description?, visible? }
  return axiosClient.post(ENDPOINTS.BLOG_CATEGORY.CREATE, payload);
}

// Güncelle
export function updateBlogCategory(id, payload) {
  return axiosClient.put(ENDPOINTS.BLOG_CATEGORY.UPDATE(id), payload);
}

// Sil
export function deleteBlogCategory(id) {
  return axiosClient.delete(ENDPOINTS.BLOG_CATEGORY.DELETE(id));
}
