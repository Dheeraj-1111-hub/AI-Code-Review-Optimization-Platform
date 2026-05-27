import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const useAPIKeys = () => {
  const { getToken } = useAuth();
  
  return useQuery({
    queryKey: ['workspace', 'api-keys'],
    queryFn: async () => {
      const token = await getToken();
      const { data } = await axios.get(`${API_URL}/api-keys`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data.data;
    }
  });
};

export const useGenerateAPIKey = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { name: string }) => {
      const token = await getToken();
      const { data } = await axios.post(`${API_URL}/api-keys`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data.data; // This will contain { apiKey, rawKey }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', 'api-keys'] });
    }
  });
};

export const useRevokeAPIKey = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      const { data } = await axios.delete(`${API_URL}/api-keys/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', 'api-keys'] });
    }
  });
};
