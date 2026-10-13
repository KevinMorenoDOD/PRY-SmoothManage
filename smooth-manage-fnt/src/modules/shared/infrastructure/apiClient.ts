import axios from "axios";
import { attachToken, handleAuthError } from "./authInterceptor";

export const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(attachToken);
apiClient.interceptors.response.use((response) => response, handleAuthError);