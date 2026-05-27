import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const useNotifications = () => {
  const { getToken } = useAuth();
  
  return useQuery({
    queryKey: ['user', 'notifications'],
    queryFn: async () => {
      const token = await getToken();
      const { data } = await axios.get(`${API_URL}/users/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data.data;
    },
    refetchInterval: 30000 // Refetch every 30 seconds for new notifications
  });
};
