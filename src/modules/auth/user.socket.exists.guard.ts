import { SocketRoomService } from '../socket/socket.room.service';
import { SocketUserService } from '../socket/socket.user.service';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';

@Injectable()
export class UserSocketExistsGuard implements CanActivate {
  constructor(
    private readonly socketUserService: SocketUserService,
    private readonly socketRoomService: SocketRoomService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user.sub;
    if (
      this.socketUserService.userOriginalIdExists(userId) ||
      this.socketRoomService.hasUserOriginalIdInAnyRoom(userId)
    ) {
      const logger = new Logger(UserSocketExistsGuard.name);
      logger.error('User already logged');
      throw new ForbiddenException('User already logged');
    }
    return true;
  }
}
