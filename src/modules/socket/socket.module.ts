import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { SocketMessageService } from './socket.message.service';
import { SocketService } from './socket.service';
import { SocketUserService } from './socket.user.service';

@Module({
  providers: [SocketService, SocketGateway, SocketUserService, SocketMessageService],
})
export class SocketModule {}
