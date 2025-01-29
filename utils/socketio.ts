"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const initializeSocket = async () => {
  if (!socket) {
    socket = io(); // Update with your server URL
  }
  return socket;
};

export const getSocket = () => {
  if (!socket)
    throw new Error("Socket not initialized. Call initializeSocket first.");
  return socket;
};
