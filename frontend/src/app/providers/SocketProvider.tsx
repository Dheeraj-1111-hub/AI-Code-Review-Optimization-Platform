import * as React from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Socket } from 'socket.io-client';
import { initSocket, disconnectSocket } from '../../services/socket/socket';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

export const SocketContext = React.createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { getToken, isSignedIn } = useAuth();
  const [socket, setSocket] = React.useState<Socket | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;

    const connectSocket = async () => {
      if (isSignedIn) {
        try {
          const token = await getToken();
          if (token && mounted) {
            const socketInstance = await initSocket(token);
            setSocket(socketInstance);
            
            socketInstance.on('connect', () => setIsConnected(true));
            socketInstance.on('disconnect', () => setIsConnected(false));
          }
        } catch (error) {
          console.error('Failed to initialize socket:', error);
        }
      } else {
        disconnectSocket();
        setSocket(null);
        setIsConnected(false);
      }
    };

    connectSocket();

    return () => {
      mounted = false;
      disconnectSocket();
    };
  }, [isSignedIn, getToken]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
