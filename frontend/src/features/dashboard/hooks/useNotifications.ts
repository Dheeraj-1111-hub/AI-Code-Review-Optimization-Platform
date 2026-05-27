import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { api } from '@/services/api/client';

export const useNotifications = () => {
  const { isSignedIn, isLoaded } = useAuth();
  return useQuery({
    queryKey: ['user', 'notifications'],
    queryFn: async () => {
      const data = await api.get(`/v1/users/notifications`);
      return data.data;
    },
    enabled: isLoaded && !!isSignedIn, // Only fetch when Clerk is ready and user is signed in
    refetchInterval: 30000 // Refetch every 30 seconds for new notifications
  });
};
