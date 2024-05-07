import { AuthGuard } from '../auth/auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { FindOneParams } from '../find-one.params';
import { GetUserDto, GetUserExposeDto } from './dto/get-user.dto';
import { PageDto } from '@/dto/page.dto';
import { plainToInstance } from 'class-transformer';
import { Request as ERequest } from 'express';
import { Response } from 'express';
import { RoleEnum } from '@prisma/client';
import { RoleGuard } from '../auth/role.guard';
import { UpdateUserDto, UpdateUserPasswordDto } from './dto/update-user.dto';
import { UserPaginatedDto } from './dto/user.paginated.dto';
import { UserService } from './user.service';
import { UserSocketExistsGuard } from '../auth/user.socket.exists.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Res,
  Request,
  UseGuards,
  Query,
  Logger,
} from '@nestjs/common';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  private readonly logger = new Logger(UserController.name);

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto, @Request() req: ERequest) {
    this.logger.log(`createUser: Request made to ${req.url}`);
    this.logger.log(`Data sent: ${JSON.stringify(createUserDto.email)}`);
    const user = await this.userService.createUser(createUserDto);
    return plainToInstance(GetUserDto, user);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(@Param() params: FindOneParams, @Request() req: ERequest) {
    this.logger.log(`findOne: Request made to ${req.url}`);
    this.logger.log(`Data sent: ${JSON.stringify(params)}`);
    const { id } = params;
    const user = await this.userService.getUser(id);
    return plainToInstance(GetUserExposeDto, user);
  }

  @UseGuards(AuthGuard, new RoleGuard([RoleEnum.admin]))
  @Get()
  async getUsers(@Request() req: ERequest): Promise<GetUserDto[]> {
    this.logger.log(`getUsers: Request made to ${req.url}`);
    const users = await this.userService.getUsers();
    return plainToInstance(GetUserDto, users);
  }

  @UseGuards(AuthGuard)
  @Put()
  async updateUser(@Body() updateUserDto: UpdateUserDto, @Request() req: ERequest) {
    this.logger.log(`updateUser: Request made to ${req.url}`);
    this.logger.log(`Data sent: ${JSON.stringify(updateUserDto)}`);
    this.logger.log(`Data sent: ${JSON.stringify(req.user.sub)}`);
    updateUserDto.id = req.user.sub;
    const user = await this.userService.updateUser(updateUserDto);
    return plainToInstance(GetUserDto, user);
  }

  @UseGuards(AuthGuard, new RoleGuard([RoleEnum.admin]))
  @Delete(':id')
  async deleteUser(@Param() params: FindOneParams, @Res() res: Response, @Request() req: ERequest) {
    this.logger.log(`deleteUser: Request made to ${req.url}`);
    this.logger.log(`Data sent: ${JSON.stringify(params)}`);
    const { id } = params;
    const response = await this.userService.deleteUser(id);
    return res.status(response.statusCode).json(response.toJson());
  }

  @UseGuards(AuthGuard)
  @Put('change-password')
  async updateUserPassword(
    @Body() updateUserPasswordDto: UpdateUserPasswordDto,
    @Request() req: ERequest
  ) {
    this.logger.log(`updateUserPassword: Request made to ${req.url}`);
    this.logger.log(`Data sent: ${JSON.stringify(req.user.sub)}`);
    updateUserPasswordDto.id = req.user.sub;
    const user = await this.userService.updateUserPassword(updateUserPasswordDto);
    return plainToInstance(GetUserDto, user);
  }

  @UseGuards(AuthGuard, UserSocketExistsGuard)
  @Get('profile/me')
  async getMe(@Request() req: ERequest) {
    this.logger.log(`getMe: Request made to ${req.url}`);
    this.logger.log(`Data sent: ${JSON.stringify(req.user.sub)}`);
    const userId = req.user.sub;
    const user = await this.userService.getUser(userId);
    return plainToInstance(GetUserDto, user);
  }

  @UseGuards(AuthGuard)
  @Get('all/paginated')
  async getUsersPaginated(
    @Query() page: PageDto,
    @Request() req: ERequest
  ): Promise<UserPaginatedDto<GetUserExposeDto>> {
    this.logger.log(`getUsersPaginated: Request made to ${req.url}`);
    this.logger.log(`Data sent: ${JSON.stringify(page)}`);
    const usersPaginated = await this.userService.getUsersPaginated(page);
    return plainToInstance(UserPaginatedDto<GetUserExposeDto>, usersPaginated);
  }
}
