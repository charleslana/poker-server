import { Expose } from 'class-transformer';

export class GetUserDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  name: string | null;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

export class GetUserExposeDto {
  @Expose()
  id: number;

  @Expose()
  name: string | null;
}
