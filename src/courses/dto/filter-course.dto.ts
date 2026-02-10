import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CourseType } from '../entities/course.entity';

export class CourseFilterDto {
  @IsOptional()
  title?: string;

  @IsOptional()
  @IsEnum(CourseType)
  type?: CourseType;
}
