import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';
import { SocketUserService } from './socket.user.service';

@Module({
  providers: [SocketService, SocketGateway, SocketUserService],
})
export class SocketModule {}
