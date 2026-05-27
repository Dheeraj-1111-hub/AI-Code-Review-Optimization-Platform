import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api/client";

export const useAnalytics = () => {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const data = await api.get(`/v1/analytics`);
      return data.data;
    },
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
