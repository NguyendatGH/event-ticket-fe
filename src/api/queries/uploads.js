// Hook POST /uploads/images.

import { useMutation } from "@tanstack/react-query";
import * as uploadsApi from "../services/uploads";

export const useUploadImage = (options) =>
  useMutation({ mutationFn: ({ file, ...rest }) => uploadsApi.uploadImage(file, rest), ...options });
