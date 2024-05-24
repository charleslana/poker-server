import { faker } from '@faker-js/faker';
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
    this.handleChangeUserWatch(socket, server);
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
      this.getAllUsers(socket, server);
      const existRoom = this.socketRoomService.getRoomByUser(clientId);
      if (existRoom) {
        socket.leave(existRoom.id);
        const user = existRoom.users.find((user) => user.id === clientId);
        this.changeRoomOwner(existRoom.id, clientId, user.originalId);
        this.socketRoomService.removeUserFromRoom(existRoom.id, clientId);
        this.getAllRooms(server);
        this.getRoom(server, existRoom.id);
      }
      socket.leave('lobby-room');
      this.logger.log(`Usuário desconectado: ${clientId}`);
    });
  }

  private getAllUsers(_socket: Socket, server: Server): void {
    const allUsers = this.socketUserService.getAllUsers();
    server.emit('allUsers', allUsers);
  }

  private handleGetAllUsers(socket: Socket, server: Server): void {
    socket.on('getAllUsers', () => {
      this.getAllUsers(socket, server);
    });
  }

  private handleUpdateUserName(socket: Socket, server: Server): void {
    socket.on('updateUserName', (newName: string, originalId: number) => {
      this.socketUserService.updateUserName(socket.id, newName);
      this.socketUserService.updateUserOriginalId(socket.id, originalId);
      this.getAllUsers(socket, server);
      socket.emit('joinLobbySuccess');
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
      const roomId = faker.string.uuid();
      const user = this.socketUserService.getUser(userId);
      if (user && !this.socketRoomService.hasUserInAnyRoom(userId)) {
        user.watch = false;
        const room = this.socketRoomService.addRoom({
          id: roomId,
          name: rooName,
          users: [user],
          ownerId: user.originalId,
        });
        this.getAllRooms(server);
        this.socketUserService.removeUser(userId);
        this.getAllUsers(socket, server);
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
        user.watch = true;
        this.socketRoomService.addUserToRoom(roomId, user);
        this.socketUserService.removeUser(userId);
        this.getAllUsers(socket, server);
        const room = this.getRoom(server, roomId);
        socket.leave('lobby-room');
        socket.join(roomId);
        server.emit('joinRoomSuccess', room);
        this.getAllRooms(server);
        this.logger.log('Room joined ID:', roomId);
      }
    });
  }

  private handleLeaveRoom(socket: Socket, server: Server): void {
    socket.on('leaveRoom', (roomId: string, userName: string, originalId: number) => {
      socket.leave(roomId);
      this.changeRoomOwner(roomId, socket.id, originalId);
      this.socketRoomService.removeUserFromRoom(roomId, socket.id);
      this.socketUserService.addUser({ id: socket.id, name: socket.id });
      this.socketUserService.updateUserName(socket.id, userName);
      this.socketUserService.updateUserOriginalId(socket.id, originalId);
      socket.join('lobby-room');
      this.getRoom(server, roomId);
      this.getAllRooms(server);
      socket.emit('leaveRoomSuccess');
      this.logger.log('Room leave ID:', roomId);
    });
  }

  private changeRoomOwner(roomId: string, clientId: string, originalId: number): void {
    const isRoomOwner = this.socketRoomService.isRoomOwner(roomId, originalId);
    const userLast = this.socketRoomService.getLastUserExcept(roomId, clientId);
    if (isRoomOwner && userLast) {
      userLast.watch = false;
      this.socketRoomService.updateRoomOwnerId(roomId, userLast.originalId);
    }
  }

  private getRoom(server: Server, roomId: string): RoomInterface {
    const room = this.socketRoomService.getRoom(roomId);
    server.to(roomId).emit('getRoom', room);
    return room;
  }

  private handleChangeUserWatch(socket: Socket, server: Server): void {
    socket.on('changeWatch', (roomId: string, watch: boolean, originalId: number) => {
      const isRoomOwner = this.socketRoomService.isRoomOwner(roomId, originalId);
      if (!isRoomOwner) {
        this.socketRoomService.updateUserWatchInRoom(roomId, socket.id, watch);
        this.getRoom(server, roomId);
        this.getAllRooms(server);
      }
    });
  }
}
