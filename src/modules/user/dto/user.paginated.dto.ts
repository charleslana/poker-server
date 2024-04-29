import { Expose, Type } from 'class-transformer';
import { GetUserExposeDto } from './get-user.dto';
import { PaginatedDto } from '@/dto/paginated.dto';

export class UserPaginatedDto<T> {
  @Expose()
  @Type(() => GetUserExposeDto)
  results: T;

  @Expose()
  @Type(() => PaginatedDto)
  pagination: PaginatedDto;
}
