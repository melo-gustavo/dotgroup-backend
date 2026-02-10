import { PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { CreateCourseDto } from './create-course.dto';

export class UpdateCourseDto extends PartialType(CreateCourseDto) {
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'true';
    return false;
  })
  @IsBoolean()
  removeImage?: boolean;
  id: number;
}
