import { Expose, Type } from 'class-transformer';
import { GetUserDto } from './get-user.dto';
import { PaginatedDto } from '@/dto/paginated.dto';

export class UserPaginatedDto<T> {
  @Expose()
  @Type(() => GetUserDto)
  results: T;

  @Expose()
  @Type(() => PaginatedDto)
  pagination: PaginatedDto;
}
