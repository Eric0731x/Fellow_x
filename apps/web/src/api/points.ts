import { apiClient } from './client';
import type { PointsSummary } from '@fellowx/shared';

export async function getPointsSummaryApi(): Promise<PointsSummary> {
  return apiClient.get('/points/summary');
}
