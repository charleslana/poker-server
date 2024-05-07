import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { SocketMessageService } from './socket.message.service';
import { SocketRoomService } from './socket.room.service';
import { SocketService } from './socket.service';
import { SocketUserService } from './socket.user.service';

@Module({
  providers: [
    SocketService,
    SocketGateway,
    SocketUserService,
    SocketMessageService,
    SocketRoomService,
  ],
  exports: [SocketUserService, SocketRoomService],
})
export class SocketModule {}
