import { ApiProperty } from '@nestjs/swagger';
import { CourseType } from '../entities/course.entity';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCourseDto {
  @ApiProperty({ example: 'Course Title' })
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Course description' })
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: CourseType.TECHNOLOGY })
  @IsNotEmpty()
  type: CourseType;

  @ApiProperty({ example: new Date(), required: false })
  @Type(() => Date)
  @IsOptional()
  createdAt?: Date;

  @ApiProperty({ example: new Date(), required: false })
  @Type(() => Date)
  @IsOptional()
  updatedAt?: Date;
}
