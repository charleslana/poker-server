import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
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

  handleConnection(socket: Socket, server: Socket): void {
    this.handleConnect(socket, server);
    this.handleDisconnect(socket, server);
    this.handleSendMessage(socket, server);
    this.handleCreateRoom(socket, server);
    this.handleRooms(socket, server);
  }

  private handleConnect(socket: Socket, server: Socket): void {
    const clientId = socket.id;
    this.socketUserService.addUser({ id: clientId, name: clientId });
    this.getAllUsers(server);
    this.logger.log(`Usuário conectado: ${clientId}`);
  }

  private handleDisconnect(socket: Socket, server: Socket): void {
    socket.on('disconnect', () => {
      const clientId = socket.id;
      this.socketUserService.removeUser(clientId);
      this.getAllUsers(server);
      const isRoomRemoved = this.socketRoomService.removeUserFromRoom(clientId, clientId);
      if (isRoomRemoved) {
        this.getAllRooms(server);
      }
      this.logger.log(`Usuário desconectado: ${clientId}`);
    });
  }

  private getAllUsers(server: Socket): void {
    const allUsers = this.socketUserService.getAllUsers();
    server.emit('allUsers', allUsers);
  }

  private handleSendMessage(socket: Socket, server: Socket): void {
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

  private handleCreateRoom(socket: Socket, server: Socket): void {
    socket.on('createRoom', (rooName: string) => {
      const userId = socket.id;
      if (!this.socketRoomService.hasUserInAnyRoom(userId)) {
        const user = this.socketUserService.getUser(userId);
        this.socketRoomService.addRoom({
          id: userId,
          name: rooName,
          users: [user],
        });
        this.getAllRooms(server);
        this.socketUserService.removeUser(userId);
        this.getAllUsers(server);
        this.logger.log('Room created:', rooName);
      }
    });
  }

  private getAllRooms(server: Socket): void {
    const allRooms = this.socketRoomService.getAllRooms();
    server.emit('allRooms', allRooms);
  }

  private handleRooms(socket: Socket, server: Socket): void {
    socket.on('getAllRooms', () => {
      this.getAllRooms(server);
    });
  }
}
