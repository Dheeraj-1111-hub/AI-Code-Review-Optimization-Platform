import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api/client';

export interface GetReviewsParams {
  page?: number;
  limit?: number;
  status?: string;
  language?: string;
  search?: string;
}

export const useReviews = (params?: GetReviewsParams) => {
  return useQuery({
    queryKey: ['reviews', params],
    queryFn: async () => {
      const response = await api.get('/v1/reviews', { params });
      return response as any;
    },
  });
};

export const useReviewDetail = (id: string) => {
  return useQuery({
    queryKey: ['review', id],
    queryFn: async () => {
      const response = await api.get(`/v1/reviews/${id}`);
      return response as any;
    },
    enabled: !!id,
  });
};
