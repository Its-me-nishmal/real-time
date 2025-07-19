import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();

// Enable CORS for Express
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
}));

app.get("/", (req, res) => {
  res.send("Server is running");
});

// HTTP + Socket Server
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  socket.on("messaged", (msg) => {
    io.emit("message", msg);
    console.log("📨", msg);
  });

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

const port = process.env.PORT || 3001;
const host = '0.0.0.0'; // ✅ Required for Render

httpServer.listen(Number(port), host, () => {
  console.log(`✅ Server listening on http://${host}:${port}`);
});

// Optional graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Shutting down server...');
  io.close(() => {
    console.log('✅ Server shut down.');
    process.exit(0);
  });
});
