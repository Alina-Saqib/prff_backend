import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import sequelize from './config/connectDB'; 
import auth from './routes/auth';
import service from './routes/service';
import chat from './routes/chat';
import { Server , Socket } from "socket.io";
import cors from 'cors';




dotenv.config();

const app = express();
const PORT = process.env.PORT;



app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

const server = http.createServer(app);


async function initializeDatabase() {
  try {
      await sequelize.authenticate();
      console.log('Connected to MySQL');
      await sequelize.sync();
      console.log('Database synchronized');
  } catch (error) {
      console.error('Error connecting to MySQL:', error);
  }
}

initializeDatabase();

sequelize.sync().then(() => {
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});




app.get('/',(req,res)=>{
    res.send('Api is running');
})

app.use('/auth', auth);
app.use('/service', service);
app.use('/chat', chat);

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:5173",
  },
});

io.on('connection', (socket: Socket) => {
  console.log(`Socket ${socket.id} connected`);

  socket.on('sendMessage', (message) => {
    socket.emit('message', message);
  });

  socket.on('disconnect', () => {
    console.log(`Socket ${socket.id} disconnected`);
  });
});
