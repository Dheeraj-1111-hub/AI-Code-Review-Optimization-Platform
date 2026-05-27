import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const useAnalytics = () => {
  const { getToken } = useAuth();
  
  return useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const token = await getToken();
      const { data } = await axios.get(`${API_URL}/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data.data;
    },
    retry: false
  });
};

export const useGenerateAnalytics = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      const { data } = await axios.post(`${API_URL}/analytics/generate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    }
  });
};
