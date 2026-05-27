import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api/client';

export const useDashboardOverview = (workspaceId: string) => {
  return useQuery({
    queryKey: ['dashboard', workspaceId],
    queryFn: async () => {
      const data = await api.get(`/v1/dashboard/overview/${workspaceId}`);
      return data;
    },
    enabled: !!workspaceId,
    staleTime: 60 * 1000, // 1 minute
  });
};
