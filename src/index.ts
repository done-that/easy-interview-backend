import * as dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import http from 'http';
import { Server } from 'socket.io';
import { Interview } from './interview';

dotenv.config();

if (!process.env.PORT) {
  process.exit(1);
}

const allowlist = ['http://localhost:3000', 'http://localhost:7000']

const PORT: number = parseInt(process.env.PORT as string, 10);
const app = express();
app.use(helmet());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowlist,
    methods: ['GET', 'POST'],
  },
});
const interview = new Interview();

io.on('connection', (socket) => {
  console.log('connected');
  interview.initialize(io, socket);
});

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});