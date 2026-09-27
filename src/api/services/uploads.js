import { client } from "../client";

/**
 * POST /uploads/images (multipart) → 201 {url, contentType, bytes}
 * folder: avatars | events | organizers. Lỗi: 400 UNSUPPORTED_FILE_TYPE, 413 FILE_TOO_LARGE.
 * Không tự đặt Content-Type: trình duyệt thêm boundary cho FormData.
 */
export const uploadImage = (file, { folder, onProgress, signal } = {}) => {
  const form = new FormData();
  form.append("file", file);
  if (folder) form.append("folder", folder);
  return client.post("/uploads/images", form, {
    signal,
    timeout: 60_000,
    onUploadProgress: onProgress && ((e) => e.total && onProgress(Math.round((e.loaded / e.total) * 100))),
  });
};
