import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const useProfile = () => {
  const { getToken } = useAuth();
  
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: async () => {
      const token = await getToken();
      const { data } = await axios.get(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data.data;
    }
  });
};

export const useUpdateProfile = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { name: string; email: string }) => {
      const token = await getToken();
      const { data } = await axios.put(`${API_URL}/users/profile`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    }
  });
};

export const useWorkspaceSettings = () => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['workspace', 'settings'],
    queryFn: async () => {
      const token = await getToken();
      const { data } = await axios.get(`${API_URL}/workspaces/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data.data;
    }
  });
};

export const useUpdateSettings = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { aiConfig?: any; settings?: any; integrations?: any }) => {
      const token = await getToken();
      const { data } = await axios.put(`${API_URL}/workspaces/settings`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', 'settings'] });
      // Invalidate AI queries if config changes
      queryClient.invalidateQueries({ queryKey: ['workspace', 'standards'] });
    }
  });
};
