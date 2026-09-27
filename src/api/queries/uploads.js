import { useMutation } from "@tanstack/react-query";
import * as uploadsApi from "../services/uploads";

/** POST /uploads/images. mutate({ file, folder, onProgress }) → {url, contentType, bytes} */
export const useUploadImage = (options) =>
  useMutation({ mutationFn: ({ file, ...rest }) => uploadsApi.uploadImage(file, rest), ...options });
