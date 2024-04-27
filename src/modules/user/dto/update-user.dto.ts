import { IsNotEmpty, IsNumber, Matches, MaxLength, Min, MinLength } from 'class-validator';
import { UserDto } from './user.dto';

export class UpdateUserDto {
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(15)
  @Matches(/^[a-zA-Z0-9]*$/, { message: 'O nome deve conter apenas letras e números' })
  name: string;

  @IsNumber()
  @Min(1)
  id: number;
}

export class UpdateUserPasswordDto extends UserDto {
  @IsNotEmpty()
  currentPassword: string;

  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(30)
  newPassword: string;

  @IsNumber()
  @Min(1)
  id: number;
}
