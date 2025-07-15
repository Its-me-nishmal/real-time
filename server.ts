import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log(`A user connected: ${socket.id}`);

  socket.on("chat message", (msg: { type: string; data: string }) => {
    console.log(`[SERVER] Received message from ${socket.id}:`, msg);

    // This is the object we will broadcast. It MUST be flat.
    const broadcastMessage = {
      id: socket.id,
      type: msg.type,
      data: msg.data,
    };

    console.log(`[SERVER] Broadcasting message:`, broadcastMessage);
    io.emit("chat message", broadcastMessage);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const port = 3001
const host = 'https://chat.nichu.dev';

httpServer.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${port} is already in use.`);
  } else {
    console.error(err);
  }
});

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