import { Server, Socket } from 'socket.io';

const interviewsInSession: Socket[] = [];

interface IUserData {
  interviewId: string;
  socketId: string;
  username: string;
}

interface ICodeChange {
  interviewId: string;
  code: string;
}

/**
 * Here is where we should register event listeners and emitters. 
 */
export class Interview {
  io: Server;
  socket: Socket;
  constructor(sio: Server, socket: Socket) {
    this.io = sio;
    this.socket = socket;
    this.startInterviewSession();
  }

  private startInterviewSession() {
    interviewsInSession.push(this.socket);

    this.socket.on("disconnect", this.onDisconnect.bind(this))

    // Sends new move to the other socket session in the same room. 
    this.socket.on("code updated", this.codeUpdated.bind(this))

    // User creates new game room after clicking 'submit' on the frontend
    this.socket.on("create-interview", this.createNewInterview.bind(this))

    // User joins gameRoom after going to a URL with '/game/:gameId' 
    this.socket.on("join-interview", this.joinInterview.bind(this))

    this.socket.on('request username', this.requestUsername.bind(this))

    this.socket.on('recieved username', this.recievedUsername.bind(this))

    // register event listeners for video chat app:
    this.videoChatBackend()
  }

  private videoChatBackend() {
    // main function listeners
    this.socket.on("callUser", (data) => {
      this.io.to(data.userToCall).emit('hey', { signal: data.signalData, from: data.from });
    })

    this.socket.on("acceptCall", (data) => {
      this.io.to(data.to).emit('callAccepted', data.signal);
    })
  }

  joinInterview(idData: IUserData) {
    /**
     * Joins the given socket to a session with it's gameId
     */

    // A reference to the player's Socket.IO socket object
    const sock = this.socket

    // Look up the room ID in the Socket.IO manager object.
    const room = this.io.sockets.adapter.rooms[idData.interviewId]
    // console.log(room)

    // If the room exists...
    if (room === undefined) {
      sock.emit('status', "This game session does not exist.");
      return
    }
    if (room.length < 2) {
      // attach the socket id to the data object.
      idData.socketId = sock.id;

      // Join the room
      sock.join(idData.interviewId);

      console.log(room.length)

      if (room.length === 2) {
        this.io.sockets.in(idData.interviewId).emit('start interview', idData.username)
      }

      // Emit an event notifying the clients that the player has joined the room.
      this.io.sockets.in(idData.interviewId).emit('user joined room', idData);

    } else {
      // Otherwise, send an error message back to the player.
      sock.emit('status', "There are already 2 people in this room.");
    }
  }


  createNewInterview(user: IUserData) {
    this.socket.emit('create-interview', { ...user, socketId: this.socket.id });

    // Join the Room and wait for the other player
    this.socket.join(user.interviewId)
  }


  codeUpdated(change: ICodeChange) {
    /**
     * First, we need to get the room ID in which to send this message. 
     * Next, we actually send this message to everyone except the sender
     * in this room. 
     */
    console.log(change);

    const { interviewId } = change

    this.io.to(interviewId).emit('code updated', change);
  }

  onDisconnect() {
    const sockIndex = interviewsInSession.indexOf(this.socket);
    interviewsInSession.splice(sockIndex, 1);
  }

  requestUsername(interviewId: string) {
    this.io.to(interviewId).emit('give username', this.socket.id);
  }

  recievedUsername(data: IUserData) {
    data.socketId = this.socket.id
    this.io.to(data.interviewId).emit('get username', data);
  }
}