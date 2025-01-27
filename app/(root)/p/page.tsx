"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/context/SocketContext";

export default function Home() {
  const socket = useSocket();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [connectedSockets, setConnectedSockets] = useState(0);

  useEffect(() => {
    if (socket) {
      socket.on("init", (msgs: string[]) => setMessages(msgs));
      socket.on("arrSocket", (count: number) => setConnectedSockets(count));
      socket.on("message", (msg: string) =>
        setMessages((prev) => [...prev, msg])
      );
    }

    return () => {
      if (socket) {
        socket.off("init");
        socket.off("arrSocket");
        socket.off("message");
      }
    };
  }, [socket]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (socket && message.trim()) {
      socket.emit("message", message);
      setMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="max-w-xl bg-zinc-800 text-white rounded-lg shadow-md p-6 w-full">
        <h1 className="text-2xl font-bold mb-4">Real-time Chat</h1>
        <p className="mb-2">Connected Users: {connectedSockets}</p>
        <div className="h-96 overflow-y-auto mb-4 p-4 border rounded-lg">
          {messages.map((msg, index) => (
            <div key={index} className="mb-2 p-2 bg-zinc-700 rounded">
              {msg}
            </div>
          ))}
        </div>
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 p-2 border rounded text-black"
            placeholder="Type your message..."
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
