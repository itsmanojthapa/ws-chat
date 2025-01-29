import { Server as HttpServer } from "http";
import { Server } from "socket.io";

const db: { roomName: string; messages: string[] }[] = [
  { roomName: "home", messages: [] },
];

export const initSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*", // Update as needed
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(
      `Client connected ID: ${socket.id} | Total: ${io.engine.clientsCount}`
    );

    socket.on("error", (err) => {
      console.log(err);
    });

    socket.on("init", (rName: string | "home") => {
      return db.find((room) => room.roomName === rName)?.messages;
    });

    // socket.emit(
    //   "init",
    //   db.find((room) => room.roomName === "home")?.messages
    // );
    io.emit("arrSocket", io.engine.clientsCount);
    console.log(
      "------------------------------------",
      io.sockets.adapter.rooms.get("home")?.size
    );

    io.on(
      "arrSocketRoom",
      (roomName: string) => io.sockets.adapter.rooms.get(roomName)?.size || 1
    );

    socket.on("message", (msg: string) => {
      const homeRoom = db.find((room) => room.roomName === "home");
      if (homeRoom) {
        homeRoom.messages.push(msg);
        io.to("home").emit("message", msg);
      }
    });

    socket.on("messageRoom", (roomName: string, msg: string) => {
      let room = db.find((room) => room.roomName === roomName);
      if (!room) {
        room = { roomName, messages: [] };
        db.push(room);
      }
      room.messages.push(msg);
      console.log(`Message in room ${roomName}: ${msg}`);

      io.to(roomName).emit("message", msg);
    });

    socket.on("joinRoom", (roomName) => {
      socket.join(roomName);
      socket.emit(
        "init",
        db.find((room) => room.roomName === roomName)?.messages || []
      );
      console.log(`${socket.id} joined room: ${roomName}`);
      io.to(roomName).emit(
        "arrSocketRoom",
        io.sockets.adapter.rooms.get(roomName)?.size
      );
      io.emit("arrSocket", io.engine.clientsCount);
    });

    socket.on("leaveRoom", (roomName) => {
      socket.leave(roomName);
      console.log(`${socket.id} left room: ${roomName}`);
      io.to(roomName).emit(
        "arrSocketRoom",
        io.sockets.adapter.rooms.get(roomName)?.size
      );
    });

    socket.on("disconnect", () => {
      console.log(
        `Client disconnected ID: ${socket.id} | Total: ${io.engine.clientsCount}`
      );
    });
  });

  return io;
};
