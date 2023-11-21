import dotenv from "dotenv";
import express from "express";
import http from "http";
import bodyParser from "body-parser";
import sequelize from "./config/connectDB";
import auth from "./routes/auth";
import service from "./routes/service";
import chat from "./routes/chat";
import { Server, Socket } from "socket.io";
import cors from "cors";
import quickResponses from './routes/quickResponses';
import blockRoutes from './routes/blockRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));

const server = http.createServer(app);

async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log("Connected to MySQL");
    await sequelize.sync();
    console.log("Database synchronized");
  } catch (error) {
    console.error("Error connecting to MySQL:", error);
  }
}

initializeDatabase();

sequelize.sync().then(() => {
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});

app.get("/", (req, res) => {
  res.send("Api is running");
});

app.use("/auth", auth);
app.use("/service", service);
app.use("/chat", chat);
app.use("/quickResponses" ,quickResponses)
app.use("/api" ,blockRoutes)

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket: Socket) => {
  console.log(`Socket ${socket.id} connected`);

  socket.on("joinChat", (chatId) => {
    console.log("user join", chatId);
    socket.join(chatId);
  });

  socket.on("sendMessage", (message, chatId) => {
    console.log(`Socket ${socket.id} sent a message in chat ${chatId}`);
    console.log("message", message);
    // io.to(chatId).emit("message", message);
    io.emit("message", message);
  });

  socket.on("disconnect", () => {
    console.log(`Socket ${socket.id} disconnected`);
  });
});

export { io };
