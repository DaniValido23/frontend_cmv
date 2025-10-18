import axios from "axios";
import { toast } from "sonner";

const API_URL = import.meta.env.PUBLIC_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // No interceptar errores 401 de las rutas de autenticación
    const isAuthRoute = error.config?.url?.includes('/auth/');

    if (error.response?.status === 401 && !isAuthRoute) {
      sessionStorage.clear();
      window.location.href = "/login";
      toast.error("Sesión expirada. Inicia sesión nuevamente.");
    }

    if (error.response?.status === 403) {
      toast.error("No tienes permisos para realizar esta acción");
    }

    return Promise.reject(error);
  }
);

// Upload helper with progress
export async function uploadFile(
  file: File,
  consultationId: string,
  onProgress?: (progress: number) => void
) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("consultation_id", consultationId);

  return api.post("/attachments/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = (progressEvent.loaded / progressEvent.total) * 100;
        onProgress(Math.round(progress));
      }
    },
  });
}
