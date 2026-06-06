import { apiClient } from './client';

export interface LoginRequest {
  phone: string;
  password?: string;
  smsCode?: string;
}

export interface RegisterRequest {
  phone: string;
  password: string;
  name: string;
  smsCode: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: unknown;
}

export async function loginApi(data: LoginRequest): Promise<AuthResponse> {
  return apiClient.post('/auth/login', data);
}

export async function registerApi(data: RegisterRequest): Promise<AuthResponse> {
  return apiClient.post('/auth/register', data);
}

export async function sendSmsCodeApi(phone: string, scene: string): Promise<void> {
  return apiClient.post('/auth/sms-code', { phone, scene });
}

export async function logoutApi(): Promise<void> {
  return apiClient.post('/auth/logout');
}
