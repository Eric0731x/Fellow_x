import { apiClient } from './client';
import type { Activity } from '@fellowx/shared';

export interface ActivityQuery {
  category?: string;
  state?: string;
  keyword?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateActivityRequest {
  title: string;
  category?: string;
  summary: string;
  content?: string;
  location: string;
  coverImageUrl?: string;
  minLevelId?: number;
  maxParticipants: number;
  startTime?: string;
  endTime?: string;
  registrationDeadline?: string;
}

export async function getActivitiesApi(query: ActivityQuery = {}): Promise<PaginatedResponse<Activity>> {
  return apiClient.get('/activities', { params: query });
}

export async function getActivityApi(id: string): Promise<Activity> {
  return apiClient.get(`/activities/${id}`);
}

export async function createActivityApi(data: CreateActivityRequest): Promise<Activity> {
  return apiClient.post('/activities', data);
}

export async function updateActivityApi(id: string, data: Partial<CreateActivityRequest>): Promise<Activity> {
  return apiClient.put(`/activities/${id}`, data);
}

export async function submitReviewApi(id: string): Promise<Activity> {
  return apiClient.post(`/activities/${id}/submit-review`);
}

export async function lifecycleApi(id: string, action: string): Promise<Activity> {
  return apiClient.post(`/activities/${id}/lifecycle`, { action });
}

export async function deleteActivityApi(id: string): Promise<void> {
  return apiClient.delete(`/activities/${id}`);
}
