import { api } from "@/lib/api";
import type { UsersResponse, UserResponse, CreateUserRequest, UpdateUserRequest } from "@/types/user";
import type { SessionsResponse, RevokeSessionResponse } from "@/types/session";

export const usersApi = {

  async getUsers(page: number = 1, pageSize: number = 10, role?: string): Promise<UsersResponse> {
    let url = `/users?page=${page}&page_size=${pageSize}`;
    if (role) {
      url += `&role=${role}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  async getDoctors(): Promise<UsersResponse> {
    const response = await api.get(`/users?role=doctor&page_size=100`);
    return response.data;
  },

  async getUser(userId: string): Promise<UserResponse> {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  async createUser(userData: CreateUserRequest): Promise<UserResponse> {
    const response = await api.post("/users/", userData);
    return response.data;
  },

  async updateUser(userId: string, userData: UpdateUserRequest): Promise<UserResponse> {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },

  async activateUser(userId: string): Promise<UserResponse> {
    const response = await api.post(`/users/${userId}/activate`);
    return response.data;
  },

  async deactivateUser(userId: string): Promise<UserResponse> {
    const response = await api.post(`/users/${userId}/deactivate`);
    return response.data;
  },

  async getSessions(): Promise<SessionsResponse> {
    const response = await api.get("/auth/sessions/");
    return response.data;
  },

  async revokeSession(sessionId: string): Promise<RevokeSessionResponse> {
    const response = await api.delete(`/auth/sessions/${sessionId}`);
    return response.data;
  },
};
