export interface Session {
  id: string;
  user_id: string;
  username: string;
  full_name: string;
  role: "doctor" | "assistant" | "chemist";
  device_name: string;
  ip_address: string;
  last_activity: string;
  created_at: string;
  expires_at: string;
  revoked: boolean;
}

export interface SessionsResponse {
  success: boolean;
  message: string;
  data: Session[];
  timestamp: string;
}

export interface RevokeSessionResponse {
  success: boolean;
  message: string;
  timestamp: string;
}
