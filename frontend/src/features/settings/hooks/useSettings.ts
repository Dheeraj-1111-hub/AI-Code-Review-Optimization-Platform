import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { api } from '@/services/api/client';

export const useProfile = () => {
  const { isSignedIn, isLoaded } = useAuth();
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: async () => {
      const data = await api.get(`/v1/users/me`);
      return data.data;
    },
    enabled: isLoaded && !!isSignedIn,
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
  const { isSignedIn, isLoaded } = useAuth();
  return useQuery({
    queryKey: ['workspace', 'settings'],
    queryFn: async () => {
      const data = await api.get(`/v1/workspaces/settings`);
      return data.data;
    },
    enabled: isLoaded && !!isSignedIn,
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
