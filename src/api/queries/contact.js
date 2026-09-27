import { useMutation } from "@tanstack/react-query";
import * as contactApi from "../services/contact";

/** POST /contact. mutate({ name, email, subject?, message }) */
export const useSendContact = (options) => useMutation({ mutationFn: contactApi.send, ...options });
