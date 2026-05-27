import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

export const useRepositories = () => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["repositories"],
    queryFn: async () => {
      const token = await getToken();
      const res = await axios.get(`${API_URL}/repositories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data;
    },
  });
};

export const useRepository = (repoId: string) => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["repositories", repoId],
    queryFn: async () => {
      const token = await getToken();
      const res = await axios.get(`${API_URL}/repositories/${repoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data;
    },
    enabled: !!repoId,
  });
};

export const useConnectRepository = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const token = await getToken();
      const res = await axios.post(`${API_URL}/repositories`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Repository connected successfully!");
      queryClient.invalidateQueries({ queryKey: ["repositories"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to connect repository");
    },
  });
};

export const useScanRepository = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (repoId: string) => {
      const token = await getToken();
      const res = await axios.post(`${API_URL}/repositories/${repoId}/scan`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    onSuccess: (_, repoId) => {
      toast.success("AI Scan triggered!");
      queryClient.invalidateQueries({ queryKey: ["repositories", repoId] });
      queryClient.invalidateQueries({ queryKey: ["repositories"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to trigger scan");
    },
  });
};
