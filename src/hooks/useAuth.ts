import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface ResetPasswordPayload {
  token: string;
  new_password: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: any;
  timestamp: string;
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async (payload: ResetPasswordPayload): Promise<ApiResponse> => {
      const response = await api.post("/auth/password/reset", payload);
      return response.data;
    },
  });
}
