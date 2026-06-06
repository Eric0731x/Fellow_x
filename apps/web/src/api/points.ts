import { apiClient } from './client';
import type { PointsSummary } from '@fellowx/shared';

export async function getPointsSummaryApi(): Promise<PointsSummary> {
  return apiClient.get('/points/summary');
}

interface PointTransactionQuery {
  page?: number;
  pageSize?: number;
  pointsType?: 'GROWTH' | 'EXCHANGE';
}

export async function getPointTransactionsApi(query?: PointTransactionQuery) {
  return apiClient.get('/points/transactions', { params: query });
}

export async function dailyCheckInApi() {
  return apiClient.post('/points/daily-check-in');
}
