import { Exclude } from 'class-transformer';
import { UserDto } from './user.dto';
import {
  IsNotEmpty,
  IsNumber,
  Matches,
  MaxLength,
  Min,
  MinLength,
  NotContains,
} from 'class-validator';

export class UpdateUserDto {
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(15)
  @NotContains(' ')
  @Matches(/^[a-zA-Z0-9]*$/, { message: 'O nome deve conter apenas letras e números' })
  name: string;

  @Exclude()
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
