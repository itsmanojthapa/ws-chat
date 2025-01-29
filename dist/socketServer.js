"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const db = [
    { roomName: "home", messages: [] },
];
const initSocket = (httpServer) => {
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: "*", // Update as needed
            credentials: true,
        },
    });
    io.on("connection", (socket) => {
        var _a;
        console.log(`Client connected ID: ${socket.id} | Total: ${io.engine.clientsCount}`);
        socket.on("error", (err) => {
            console.log(err);
        });
        socket.on("init", (rName) => {
            var _a;
            return (_a = db.find((room) => room.roomName === rName)) === null || _a === void 0 ? void 0 : _a.messages;
        });
        // socket.emit(
        //   "init",
        //   db.find((room) => room.roomName === "home")?.messages
        // );
        io.emit("arrSocket", io.engine.clientsCount);
        console.log("------------------------------------", (_a = io.sockets.adapter.rooms.get("home")) === null || _a === void 0 ? void 0 : _a.size);
        io.on("arrSocketRoom", (roomName) => { var _a; return ((_a = io.sockets.adapter.rooms.get(roomName)) === null || _a === void 0 ? void 0 : _a.size) || 1; });
        socket.on("message", (msg) => {
            const homeRoom = db.find((room) => room.roomName === "home");
            if (homeRoom) {
                homeRoom.messages.push(msg);
                io.to("home").emit("message", msg);
            }
        });
        socket.on("messageRoom", (roomName, msg) => {
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
            var _a, _b;
            socket.join(roomName);
            socket.emit("init", ((_a = db.find((room) => room.roomName === roomName)) === null || _a === void 0 ? void 0 : _a.messages) || []);
            console.log(`${socket.id} joined room: ${roomName}`);
            io.to(roomName).emit("arrSocketRoom", (_b = io.sockets.adapter.rooms.get(roomName)) === null || _b === void 0 ? void 0 : _b.size);
            io.emit("arrSocket", io.engine.clientsCount);
        });
        socket.on("leaveRoom", (roomName) => {
            var _a;
            socket.leave(roomName);
            console.log(`${socket.id} left room: ${roomName}`);
            io.to(roomName).emit("arrSocketRoom", (_a = io.sockets.adapter.rooms.get(roomName)) === null || _a === void 0 ? void 0 : _a.size);
        });
        socket.on("disconnect", () => {
            console.log(`Client disconnected ID: ${socket.id} | Total: ${io.engine.clientsCount}`);
        });
    });
    return io;
};
exports.initSocket = initSocket;
