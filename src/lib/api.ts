import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";
import { navigateTo } from "@/hooks/useNavigate";
import { parseApiError, logError } from "@/lib/errorHandler";

const API_URL = import.meta.env.PUBLIC_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds timeout
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = sessionStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    logError(parseApiError(error), 'Request Interceptor');
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const apiError = parseApiError(error);
    logError(apiError, 'Response Interceptor');

    const isAuthRoute = error.config?.url?.includes('/auth/');

    if (apiError.statusCode === 401 && !isAuthRoute) {
      sessionStorage.clear();
      toast.error("Sesión expirada. Inicia sesión nuevamente.");
      navigateTo("/login");
    }

    if (apiError.statusCode === 403) {
      toast.error("No tienes permisos para realizar esta acción");
    }

    return Promise.reject(error);
  }
);

export async function uploadFile(
  file: File,
  consultationId: string,
  onProgress?: (progress: number) => void
) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("consultation_id", consultationId);

  try {
    return await api.post("/attachments/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = (progressEvent.loaded / progressEvent.total) * 100;
          onProgress(Math.round(progress));
        }
      },
    });
  } catch (error) {
    const apiError = parseApiError(error);
    logError(apiError, 'Upload File');
    throw error;
  }
}
