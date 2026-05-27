import * as React from 'react';
import { SocketContext } from '../app/providers/SocketProvider';

export function useSocket() {
  const context = React.useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
