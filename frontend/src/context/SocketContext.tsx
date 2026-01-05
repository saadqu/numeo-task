import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { socket as ioSocket, socket } from "../services/socket";
import type { Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket;
  isConnected: boolean;
}

interface SocketProviderProps {
  children: ReactNode;
}

const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({ children }: SocketProviderProps) {
  const [isConnected, setIsConnected] = useState(socket.connected);
  useEffect(() => {
    ioSocket.on("connect", () => {
      setIsConnected(true);
    });

    ioSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    return () => {
      ioSocket.off("connect");
      ioSocket.off("disconnect");
    };
  }), [];

  return (
    <SocketContext.Provider value={{ socket: ioSocket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}