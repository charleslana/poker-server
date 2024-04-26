import { AuthDto, GetAuthDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() authDto: AuthDto) {
    const auth = await this.authService.signIn(authDto);
    return plainToInstance(GetAuthDto, auth);
  }
}
