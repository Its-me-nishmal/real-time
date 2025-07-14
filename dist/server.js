"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const httpServer = (0, http_1.createServer)();
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "*",
    },
});
io.on("connection", (socket) => {
    console.log("a user connected");
    socket.on("chat message", (msg) => {
        io.emit("chat message", { id: socket.id, data: msg });
    });
    socket.on("disconnect", () => {
        console.log("user disconnected");
    });
});
const port = 3001;
httpServer.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`Port ${port} is already in use.`);
    }
    else {
        console.error(err);
    }
});
httpServer.listen(port, () => {
    console.log(`listening on *:${port}`);
});
process.on('SIGINT', () => {
    console.log('Shutting down server...');
    io.close(() => {
        console.log('Server shut down.');
        process.exit(0);
    });
});
