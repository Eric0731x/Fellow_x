import { apiClient } from './client';

export async function getNotificationsApi(params?: { page?: number; pageSize?: number }) {
  return apiClient.get('/notifications', { params });
}

export async function markNotificationReadApi(id: string) {
  return apiClient.put(`/notifications/${id}/read`);
}

export async function markAllNotificationsReadApi() {
  return apiClient.put('/notifications/read-all');
}
