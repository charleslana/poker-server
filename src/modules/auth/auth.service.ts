import { $Enums } from '@prisma/client';
import { AuthDto } from './dto/auth.dto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

interface TokenPayload {
  sub: number;
  email: string;
  roles: {
    id: number;
    name: $Enums.RoleEnum;
    userId: number;
    createdAt: Date;
    updatedAt: Date;
  }[];
}

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService
  ) {}

  async signIn(dto: AuthDto): Promise<{ access_token: string }> {
    const user = await this.userService.getUserByEmail(dto.email);
    const isPasswordValid = await dto.decryptPassword(dto.password, user?.password || '');
    if (!isPasswordValid) {
      throw new UnauthorizedException('Usuário ou senha inválida');
    }
    const payload: TokenPayload = { sub: user.id, email: user.email, roles: user.roles };
    const access_token = await this.jwtService.signAsync(payload);
    return {
      access_token,
    };
  }
}
