import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socket } from '@/lib/socket';

export const useDashboardSockets = (workspaceId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!workspaceId) return;

    const handleDashboardUpdate = (eventPayload: any) => {
      // Optimistically update the dashboard data or simply invalidate the query
      // to trigger a fresh fetch and keep everything perfectly in sync.
      queryClient.invalidateQueries({ queryKey: ['dashboard', workspaceId] });
    };

    socket.on('dashboard:update', handleDashboardUpdate);

    return () => {
      socket.off('dashboard:update', handleDashboardUpdate);
    };
  }, [workspaceId, queryClient]);
};
