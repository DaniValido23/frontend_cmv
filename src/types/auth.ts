export interface User {
  id: string;
  username: string;
  full_name: string;
  email: string;
  role: "doctor" | "assistant";
  is_active: boolean;
  two_factor_enabled: boolean;
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
