import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api/client';

export const useAPIKeys = () => {
  return useQuery({
    queryKey: ['workspace', 'api-keys'],
    queryFn: async () => {
      const data = await api.get(`/v1/api-keys`);
      return data.data;
    }
  });
};

export const useGenerateAPIKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { name: string }) => {
      const data = await api.post(`/v1/api-keys`, payload);
      return data.data; // This will contain { apiKey, rawKey }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', 'api-keys'] });
    }
  });
};

export const useRevokeAPIKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const data = await api.delete(`/v1/api-keys/${id}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', 'api-keys'] });
    }
  });
};
