"use client";

import { useEffect, useRef, useState } from "react";
import { useSocket } from "../../context/SocketContext";

export default function Home() {
  const socket = useSocket();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [connectedSockets, setConnectedSockets] = useState(0);
  const [room, setRoom] = useState("home");
  const [roomName, setRoomName] = useState(room);
  const [totalUser, setTotalUser] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (socket) {
      socket.on("arrSocket", (count: number) => setTotalUser(count));
      socket.on("arrSocketRoom", (count: number) => setConnectedSockets(count));
      socket.on("message", (msg: string) =>
        setMessages((prev) => [...prev, msg])
      );

      socket.emit("joinRoom", roomName);
      socket.on("init", (msgs: string[]) => setMessages(msgs));
      socket.emit("arrSocketRoom", roomName);
    }

    return () => {
      if (socket) {
        socket.off("init");
        socket.off("arrSocket");
        socket.off("message");
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  const sendMessageHandler = (e: React.FormEvent) => {
    e.preventDefault();
    if (socket && message.trim()) {
      socket.emit("messageRoom", roomName, message);
      setMessage("");
    }
  };

  const changeRoomHandler = (e: React.FormEvent) => {
    e.preventDefault();
    if (socket && roomName.trim()) {
      socket.emit("leaveRoom", room);
      setRoom(roomName);
      socket.emit("joinRoom", roomName);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="max-w-xl w-full">
        <div className="max-w-xl bg-zinc-800 text-white rounded-lg shadow-md p-6 w-full">
          <div className="flex justify-between">
            <h1 className="text-2xl font-bold mb-4">
              Room Live: <span>{socket?.connected ? "🍏" : "🍎"}</span>
            </h1>
            <p>Total Users: {totalUser}</p>
          </div>
          <p className="mb-2">Users in room: {connectedSockets}</p>
          <form onSubmit={changeRoomHandler} className="flex gap-2">
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="flex-1 p-2 border rounded text-black"
              placeholder="Room name..."
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Set
            </button>
          </form>
        </div>
        <div className="max-w-xl mt-3 bg-zinc-800 text-white rounded-lg shadow-md p-6 w-full">
          <h1 className="text-2xl font-bold mb-4">
            Real-time Chat <span>{socket?.connected ? "🍏" : "🍎"}</span>
          </h1>
          <div className="h-96 overflow-y-auto mb-4 p-4 border rounded-lg">
            {messages.map((msg, index) => (
              <div key={index} className="mb-2 p-2 bg-zinc-700 rounded">
                {msg}
              </div>
            ))}
            <div className="h-0" ref={messagesEndRef}></div>
          </div>
          <form onSubmit={sendMessageHandler} className="flex gap-2">
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
    </div>
  );
}
