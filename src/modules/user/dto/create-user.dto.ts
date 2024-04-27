import { IsEmail, IsLowercase, IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { UserDto } from './user.dto';

export class CreateUserDto extends UserDto {
  @IsEmail()
  @IsLowercase()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(30)
  password: string;
}
