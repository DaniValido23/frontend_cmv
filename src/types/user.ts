export type UserRole = 'doctor' | 'assistant';

export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  active: boolean;
  created_at: string | null;
  phone?: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'assistant'; // Solo se pueden crear asistentes
  phone?: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export interface UsersResponse {
  success: boolean;
  message: string;
  data: {
    users: User[];
    meta: {
      page: number;
      page_size: number;
      total_items: number;
      total_pages: number;
      has_next: boolean;
      has_previous: boolean;
    };
  };
  timestamp: string;
}

export interface UserResponse {
  success: boolean;
  message: string;
  data: User;
  timestamp: string;
}
