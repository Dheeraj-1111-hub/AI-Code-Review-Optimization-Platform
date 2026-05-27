import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api/client";
import { toast } from "react-hot-toast";

export const useRepositories = () => {
  return useQuery({
    queryKey: ["repositories"],
    queryFn: async () => {
      const res = await api.get(`/v1/repositories`);
      return res.data;
    },
  });
};

export const useRepository = (repoId: string) => {
  return useQuery({
    queryKey: ["repositories", repoId],
    queryFn: async () => {
      const res = await api.get(`/v1/repositories/${repoId}`);
      return res.data;
    },
    enabled: !!repoId,
  });
};

export const useConnectRepository = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post(`/v1/repositories`, data);
      return res;
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (repoId: string) => {
      const res = await api.post(`/v1/repositories/${repoId}/scan`, {});
      return res;
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
