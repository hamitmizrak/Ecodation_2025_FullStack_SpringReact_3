// src/api/registerService.js
import { axiosClient } from '../../lib/axiosClient';
import { ENDPOINTS } from '../../config/api';

export async function createRegisterWithImage(rolesId = 1, values, file = null, onProgress) {
  const fd = new FormData();
  // JSON’u ayrı bir @RequestPart olarak gönderiyoruz
  fd.append('register', new Blob([JSON.stringify(values)], { type: 'application/json' }));
  if (file) fd.append('file', file);

  return axiosClient.post(
    ENDPOINTS.REGISTER_CREATE(rolesId),
    fd,
    onProgress
      ? {
          onUploadProgress: (e) => {
            if (e.total && typeof onProgress === 'function') {
              onProgress(Math.round((e.loaded * 100) / e.total));
            }
          },
        }
      : undefined
  );
}
