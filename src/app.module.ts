import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { Module } from '@nestjs/common';
import { UserController } from './modules/user/user.controller';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [UserModule, AuthModule],
  controllers: [AppController, UserController],
  providers: [AppService],
})
export class AppModule {}
