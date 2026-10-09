import { client } from "../client";

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
