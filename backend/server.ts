import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
});

io.on("connection", (socket) => {
  console.log(`A user connected: ${socket.id}`);

  socket.on("messaged", (args) => {
    io.emit("message", args);
    console.log(args)
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const port = process.env.PORT || 3001;
const host = 'localhost';

httpServer.listen(Number(port), host, () => {
  console.log(`listening on ${host}:${port}`);
});

process.on('SIGINT', () => {
  console.log('Shutting down server...');
  io.close(() => {
    console.log('Server shut down.');
    process.exit(0);
  });
});