import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { SocketUserService } from '../socket/socket.user.service';

@Injectable()
export class UserSocketExistsGuard implements CanActivate {
  constructor(private readonly socketUserService: SocketUserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user.sub;
    if (this.socketUserService.userOriginalIdExists(userId)) {
      throw new ForbiddenException('User already logged');
    }
    return true;
  }
}
