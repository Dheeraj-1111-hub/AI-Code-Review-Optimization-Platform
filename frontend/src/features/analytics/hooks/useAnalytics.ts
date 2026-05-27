import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from '@clerk/clerk-react';
import { api } from "@/services/api/client";

export const useAnalytics = () => {
  const { isSignedIn, isLoaded } = useAuth();
  return useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const data = await api.get(`/v1/analytics`);
      return data.data;
    },
    enabled: isLoaded && !!isSignedIn,
    retry: false
  });
};

export const useGenerateAnalytics = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const data = await api.post(`/v1/analytics/generate`, {});
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    }
  });
};
