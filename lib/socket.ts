// lib/socket.ts
import { Server as HTTPServer } from 'http';
import { Socket as NetSocket } from 'net';
import { NextApiResponse } from 'next';
import { Server as IOServer } from 'socket.io';

export interface SocketServer extends HTTPServer {
  io?: IOServer | undefined;
}

export interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

export interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO;
}

let io: IOServer | undefined;

export const getIO = (res?: NextApiResponseWithSocket): IOServer | undefined => {
  if (!res) {
    return io;
  }

  if (!res.socket.server.io) {
    console.log('Setting up new Socket.IO server...');
    const httpServer: SocketServer = res.socket.server;
    io = new IOServer(httpServer, {
      path: '/api/socket',
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });
    res.socket.server.io = io;
  } else {
    io = res.socket.server.io;
  }

  return io;
};

export { io };
