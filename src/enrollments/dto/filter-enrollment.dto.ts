import { IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterEnrollmentDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  classId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  userId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  courseId?: number;
}
