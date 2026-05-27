import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api/client';

export const useProfile = () => {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: async () => {
      const data = await api.get(`/v1/users/me`);
      return data.data;
    }
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { name: string; email: string }) => {
      const data = await api.put(`/v1/users/profile`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    }
  });
};

export const useWorkspaceSettings = () => {
  return useQuery({
    queryKey: ['workspace', 'settings'],
    queryFn: async () => {
      const data = await api.get(`/v1/workspaces/settings`);
      return data.data;
    }
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { aiConfig?: any; settings?: any; integrations?: any }) => {
      const data = await api.put(`/v1/workspaces/settings`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', 'settings'] });
      // Invalidate AI queries if config changes
      queryClient.invalidateQueries({ queryKey: ['workspace', 'standards'] });
    }
  });
};
