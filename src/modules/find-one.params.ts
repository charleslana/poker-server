import { IsInt, IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class FindOneParams {
  @IsNumber()
  @Min(1)
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  id: number;
}
