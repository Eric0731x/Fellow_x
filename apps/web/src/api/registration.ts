import { apiClient } from './client';
import type { Registration } from '@fellowx/shared';

export interface RegistrationQuery {
  state?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export async function registerForActivityApi(activityId: string, data?: { contact?: string; note?: string }): Promise<Registration> {
  return apiClient.post(`/activities/${activityId}/register`, data ?? {});
}

export async function getMyRegistrationsApi(query: RegistrationQuery = {}): Promise<PaginatedResponse<Registration & { activity: unknown }>> {
  return apiClient.get('/registrations/mine', { params: query });
}

export async function cancelRegistrationApi(id: string): Promise<Registration> {
  return apiClient.post(`/registrations/${id}/cancel`);
}

export async function getActivityRegistrationsApi(activityId: string, query: RegistrationQuery = {}): Promise<PaginatedResponse<Registration & { user: unknown }>> {
  return apiClient.get(`/activities/${activityId}/registrations`, { params: query });
}

export async function reviewRegistrationApi(id: string, data: { approved: boolean; rejectReason?: string }): Promise<Registration> {
  return apiClient.post(`/registrations/${id}/review`, data);
}
