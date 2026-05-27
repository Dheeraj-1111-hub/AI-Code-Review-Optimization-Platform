import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useReviewSocket = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      withCredentials: true,
    });

    socket.on('connect', () => {
      console.log('Reviews Socket Connected');
    });

    // When any review finishes or errors, we want to invalidate the reviews list
    // so it fetches the fresh data
    socket.on('review-complete', (data: { reviewId: string }) => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['review', data.reviewId] });
    });

    socket.on('review-error', (data: { reviewId: string }) => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['review', data.reviewId] });
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);
};
