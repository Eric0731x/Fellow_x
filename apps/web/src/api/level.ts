import { apiClient } from './client';
import type { Level } from '@fellowx/shared';

export async function getLevelsApi(): Promise<Level[]> {
  return apiClient.get('/levels');
}
