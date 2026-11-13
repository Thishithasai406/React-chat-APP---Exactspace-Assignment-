import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

const PORT = process.env.PORT || 4000;
const app = express();
app.use(cors());
app.get("/", (_req, res) => res.send("Chat server is running"));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const history = [
  {
    id: "welcome",
    user: "Team Chat Bot",
    text: "Welcome to Team Chat 👋 Send a message to start. Type @ to mention someone.",
    time: new Date().toISOString(),
    likes: 0,
  },
];

io.on("connection", (socket) => {
  console.log("client connected:", socket.id);
  socket.emit("chat:history", history);

  // publish: client sends a message, server broadcasts it to everyone
  socket.on("chat:message", ({ user, text }) => {
    if (!text || !text.trim()) return;
    const msg = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      user,
      text: text.trim().slice(0, 1000),
      time: new Date().toISOString(),
      likes: 0,
    };
    history.push(msg);
    if (history.length > 200) history.shift();
    io.emit("chat:message", msg);
  });

  socket.on("chat:like", (id) => {
    const msg = history.find((m) => m.id === id);
    if (!msg) return;
    msg.likes += 1;
    io.emit("chat:likes", { id, likes: msg.likes });
  });

  socket.on("disconnect", () => console.log("client disconnected:", socket.id));
});

server.listen(PORT, () => console.log(`Socket.io server on http://localhost:${PORT}`));
