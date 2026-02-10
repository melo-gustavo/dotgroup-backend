import { IsInt, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ClassStatus } from '../entities/class.entity';

export class FilterClassDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  teacherId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  courseId?: number;

  @IsOptional()
  name?: string;

  @IsOptional()
  @IsEnum(ClassStatus)
  status?: ClassStatus;
}
