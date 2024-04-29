import { AuthDto, GetAuthDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { Body, Controller, HttpCode, HttpStatus, Logger, Post, Request } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Request as ERequest } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  private readonly logger = new Logger(AuthController.name);

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() authDto: AuthDto, @Request() req: ERequest) {
    this.logger.log(`signIn: Request made to ${req.url}`);
    this.logger.log(`Data sent: ${JSON.stringify(authDto.email)}`);
    const auth = await this.authService.signIn(authDto);
    return plainToInstance(GetAuthDto, auth);
  }
}
