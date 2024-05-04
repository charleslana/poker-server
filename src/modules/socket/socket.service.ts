import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { SocketUserService } from './socket.user.service';

@Injectable()
export class SocketService {
  constructor(private readonly socketUserService: SocketUserService) {}

  private readonly logger = new Logger(SocketService.name);

  handleConnection(socket: Socket): void {
    this.handleConnect(socket);
    this.handleDisconnect(socket);
    this.handleUsersConnected(socket);
  }

  private handleConnect(socket: Socket): void {
    const clientId = socket.id;
    this.socketUserService.addUser({ id: clientId, name: clientId });
    this.logger.log(`Usuário conectado: ${clientId}`);
  }

  private handleDisconnect(socket: Socket): void {
    socket.on('disconnect', () => {
      this.socketUserService.removeUser(socket.id);
      this.logger.log(`Usuário desconectado: ${socket.id}`);
    });
  }

  private handleUsersConnected(socket: Socket): void {
    socket.on('getAllUsers', () => {
      const allUsers = this.socketUserService.getAllUsers();
      socket.emit('allUsers', allUsers);
      this.logger.log('Emitindo todos os usuários do lobby');
    });
  }
}
