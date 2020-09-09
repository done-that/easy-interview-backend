import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import http from 'http';
import socket from 'socket.io';
import { Interview } from './interview';

dotenv.config();

if (!process.env.PORT) {
  process.exit(1);
}

const PORT: number = parseInt(process.env.PORT as string, 10);
const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = socket(server);

io.on('connection', client => {
  // gameLogic.initializeGame(io, client)
  console.log('connected');
  new Interview(io, client);
});

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});