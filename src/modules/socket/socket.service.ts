import { Injectable, Logger } from '@nestjs/common';
import { RoomInterface } from './interface/room.interface';
import { Server, Socket } from 'socket.io';
import { SocketMessageService } from './socket.message.service';
import { SocketRoomService } from './socket.room.service';
import { SocketUserService } from './socket.user.service';

@Injectable()
export class SocketService {
  constructor(
    private readonly socketUserService: SocketUserService,
    private readonly socketMessageService: SocketMessageService,
    private readonly socketRoomService: SocketRoomService
  ) {}

  private readonly logger = new Logger(SocketService.name);

  handleConnection(socket: Socket, server: Server): void {
    this.handleConnect(socket);
    this.handleDisconnect(socket, server);
    this.handleGetAllUsers(socket, server);
    this.handleUpdateUserName(socket, server);
    this.handleSendMessage(socket, server);
    this.handleCreateRoom(socket, server);
    this.handleRooms(socket, server);
    this.handleJoinRoom(socket, server);
    this.handleLeaveRoom(socket, server);
  }

  private handleConnect(socket: Socket): void {
    const clientId = socket.id;
    this.socketUserService.addUser({ id: clientId, name: clientId });
    socket.join('lobby-room');
    this.logger.log(`Usuário conectado: ${clientId}`);
  }

  private handleDisconnect(socket: Socket, server: Server): void {
    socket.on('disconnect', () => {
      const clientId = socket.id;
      this.socketUserService.removeUser(clientId);
      this.getAllUsers(server);
      const existRoom = this.socketRoomService.getRoomByUser(clientId);
      if (existRoom) {
        socket.leave(existRoom.id);
        this.socketRoomService.removeUserFromRoom(existRoom.id, clientId);
        this.getAllRooms(server);
        this.getRoom(server, existRoom.id);
      }
      socket.leave('lobby-room');
      this.logger.log(`Usuário desconectado: ${clientId}`);
    });
  }

  private getAllUsers(server: Server): void {
    const allUsers = this.socketUserService.getAllUsers();
    server.emit('allUsers', allUsers);
  }

  private handleGetAllUsers(socket: Socket, server: Server): void {
    socket.on('getAllUsers', () => {
      this.getAllUsers(server);
    });
  }

  private handleUpdateUserName(socket: Socket, server: Server): void {
    socket.on('updateUserName', (newName: string) => {
      this.socketUserService.updateUserName(socket.id, newName);
      this.getAllUsers(server);
    });
  }

  private handleSendMessage(socket: Socket, server: Server): void {
    socket.on('sendMessage', (message: string) => {
      const senderId = socket.id;
      const user = this.socketUserService.getUser(senderId);
      this.socketMessageService.addMessage({
        message,
        date: new Date(),
        user,
      });
      this.logger.log('Mensagem enviada:', message);
      const lastMessage = this.socketMessageService.getLastMessage();
      server.emit('lastMessage', lastMessage);
      this.logger.log('Emitindo a última mensagem');
    });
  }

  private handleCreateRoom(socket: Socket, server: Server): void {
    socket.on('createRoom', (rooName: string) => {
      const userId = socket.id;
      const roomId = userId;
      const user = this.socketUserService.getUser(userId);
      if (user && !this.socketRoomService.hasUserInAnyRoom(userId)) {
        const room = this.socketRoomService.addRoom({
          id: roomId,
          name: rooName,
          users: [user],
        });
        this.getAllRooms(server);
        this.socketUserService.removeUser(userId);
        this.getAllUsers(server);
        socket.leave('lobby-room');
        socket.join(roomId);
        server.emit('createRoomSuccess', room);
        this.logger.log('Room created:', rooName);
      }
    });
  }

  private getAllRooms(server: Server): void {
    const allRooms = this.socketRoomService.getAllRooms();
    server.emit('allRooms', allRooms);
  }

  private handleRooms(socket: Socket, server: Server): void {
    socket.on('getAllRooms', () => {
      this.getAllRooms(server);
    });
  }

  private handleJoinRoom(socket: Socket, server: Server): void {
    socket.on('joinRoom', (roomId: string) => {
      const userId = socket.id;
      const user = this.socketUserService.getUser(userId);
      if (
        user &&
        !this.socketRoomService.hasUserInAnyRoom(userId) &&
        this.socketRoomService.getRoom(roomId)
      ) {
        this.socketRoomService.addUserToRoom(roomId, user);
        this.socketUserService.removeUser(userId);
        this.getAllUsers(server);
        const room = this.getRoom(server, roomId);
        socket.leave('lobby-room');
        socket.join(roomId);
        server.emit('joinRoomSuccess', room);
        this.logger.log('Room joined ID:', roomId);
      }
    });
  }

  private handleLeaveRoom(socket: Socket, server: Server): void {
    socket.on('leaveRoom', (roomId: string, userName: string) => {
      socket.leave(roomId);
      this.socketRoomService.removeUserFromRoom(roomId, socket.id);
      this.socketUserService.addUser({ id: socket.id, name: socket.id });
      this.socketUserService.updateUserName(socket.id, userName);
      socket.join('lobby-room');
      this.getRoom(server, roomId);
      this.getAllRooms(server);
      socket.emit('leaveRoomSuccess');
    });
  }

  private getRoom(server: Server, roomId: string): RoomInterface {
    const room = this.socketRoomService.getRoom(roomId);
    server.to(roomId).emit('getRoom', room);
    return room;
  }
}
