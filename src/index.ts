import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import http from 'http';
import { Server } from 'socket.io';
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
const io = new Server(server);
const interview = new Interview();

io.on('connection', (socket) => {
  // gameLogic.initializeGame(io, client)
  console.log('connected');
  interview.initialize(io, socket);
});

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});