import { api } from "@/lib/api";
import type { UsersResponse, UserResponse, CreateUserRequest, UpdateUserRequest } from "@/types/user";

export const usersApi = {
  /**
   * Obtener lista de usuarios
   */
  async getUsers(page: number = 1, pageSize: number = 10): Promise<UsersResponse> {
    const response = await api.get(`/users?page=${page}&page_size=${pageSize}`);
    return response.data;
  },

  /**
   * Obtener un usuario específico
   */
  async getUser(userId: string): Promise<UserResponse> {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  /**
   * Crear un nuevo usuario (solo asistentes)
   */
  async createUser(userData: CreateUserRequest): Promise<UserResponse> {
    const response = await api.post("/users/", userData);
    return response.data;
  },

  /**
   * Actualizar un usuario
   */
  async updateUser(userId: string, userData: UpdateUserRequest): Promise<UserResponse> {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },

  /**
   * Activar un usuario
   */
  async activateUser(userId: string): Promise<UserResponse> {
    const response = await api.post(`/users/${userId}/activate`);
    return response.data;
  },

  /**
   * Desactivar un usuario
   */
  async deactivateUser(userId: string): Promise<UserResponse> {
    const response = await api.post(`/users/${userId}/deactivate`);
    return response.data;
  },
};
