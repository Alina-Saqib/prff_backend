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
import contactRoutes from "./routes/contactRoutes";
import draftRoutes from "./routes/draftRoutes";
import templateRoutes from "./routes/templateRoutes";
import { RecurringEmails, scheduleEmails } from "./AdminController/emailController";
import phoneRoutes from "./routes/phoneRoutes";
import { RecurringSms, scheduleSms } from "./AdminController/phoneSmsController";
import admin from './routes/admin';

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));

scheduleEmails();
RecurringEmails();
scheduleSms();
RecurringSms();

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

// const accountSid = 'AC96b2e8433e689e834cc72dde6b9878e8';
// const authToken = '73754c50c9bbbd479208f289863f7183';
// const client = require('twilio')(accountSid, authToken);

// client.validationRequests
//   .create({friendlyName: '923155351832', phoneNumber: '+923155351832'})
//   .then((validation_request: any) => console.log(validation_request.friendlyName));

app.use("/auth", auth);
app.use("/service", service);
app.use("/chat", chat);
app.use("/quickResponses" ,quickResponses);
app.use("/api" ,blockRoutes);
app.use("/contact", contactRoutes);
app.use("/draft" , draftRoutes);
app.use("/template" , templateRoutes)
app.use("/phone", phoneRoutes)
app.use("/admin",admin)



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


export {io};
