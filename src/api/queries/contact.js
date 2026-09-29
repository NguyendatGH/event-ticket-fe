// Hook POST /contact.

import { useMutation } from "@tanstack/react-query";
import * as contactApi from "../services/contact";

export const useSendContact = (options) => useMutation({ mutationFn: contactApi.send, ...options });
