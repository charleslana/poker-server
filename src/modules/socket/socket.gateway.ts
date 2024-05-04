import { OnGatewayConnection, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { SocketService } from './socket.service';

@WebSocketGateway({ cors: true })
export class SocketGateway implements OnGatewayConnection {
  constructor(private readonly socketService: SocketService) {}

  @WebSocketServer()
  private server: Socket;

  handleConnection(socket: Socket): void {
    this.socketService.handleConnection(socket);
  }
}
