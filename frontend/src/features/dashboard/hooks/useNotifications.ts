import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api/client';

export const useNotifications = () => {
  return useQuery({
    queryKey: ['user', 'notifications'],
    queryFn: async () => {
      const data = await api.get(`/v1/users/notifications`);
      return data.data;
    },
    refetchInterval: 30000 // Refetch every 30 seconds for new notifications
  });
};
