"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { initializeSocket } from "@/utils/socketio";
import { Socket } from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const setupSocket = async () => {
      const sock = await initializeSocket();
      setSocket(sock);
    };

    setupSocket();

    return () => {
      if (socket) socket.disconnect();
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    // throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
