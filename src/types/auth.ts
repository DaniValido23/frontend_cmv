export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: "doctor" | "assistant" | "chemist";
  active: boolean;
  created_at: string;
  two_factor_enabled?: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
  two_factor_code?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
    requires_2fa?: boolean;
  };
}

export interface TwoFactorSetupResponse {
  secret: string;
  qr_code: string;
  backup_codes: string[];
}
