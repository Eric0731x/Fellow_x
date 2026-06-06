import { apiClient } from './client';

interface RewardQuery {
  page?: number;
  pageSize?: number;
  category?: string;
}

export async function getRewardsApi(query?: RewardQuery) {
  return apiClient.get('/rewards', { params: query });
}

export async function redeemRewardApi(id: string) {
  return apiClient.post(`/rewards/${id}/redeem`);
}

export async function getMyOrdersApi(query?: RewardQuery) {
  return apiClient.get('/orders/mine', { params: query });
}
