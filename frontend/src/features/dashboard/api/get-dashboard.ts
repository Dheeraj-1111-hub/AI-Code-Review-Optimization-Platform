import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { api } from '@/services/api/client';

export const useDashboardOverview = (workspaceId: string) => {
  const { isSignedIn, isLoaded } = useAuth();
  return useQuery({
    queryKey: ['dashboard', workspaceId],
    queryFn: async () => {
      const data = await api.get(`/v1/dashboard/overview/${workspaceId}`);
      return data;
    },
    enabled: isLoaded && !!isSignedIn && !!workspaceId,
    staleTime: 60 * 1000, // 1 minute
  });
};
