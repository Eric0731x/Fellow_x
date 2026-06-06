import { apiClient } from './client';
import type { User } from '@fellowx/shared';

export async function getMeApi(): Promise<User & { level: unknown }> {
  return apiClient.get('/members/me');
}

export async function updateMeApi(data: {
  name?: string;
  gender?: string;
  birthday?: string;
  email?: string;
  avatarUrl?: string;
}): Promise<User & { level: unknown }> {
  return apiClient.put('/members/me', data);
}
