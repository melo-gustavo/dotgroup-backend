import { ApiProperty } from '@nestjs/swagger';
import { CourseType } from '../entities/course.entity';

export class CreateCourseDto {
  @ApiProperty({ example: 'Course Title' })
  title: string;

  @ApiProperty({ example: 'Course description' })
  description: string;

  @ApiProperty({ example: CourseType.TECNOLOGY })
  type: CourseType;

  @ApiProperty({ example: 'https://example.com/image.jpg', required: false })
  image_url?: string;

  @ApiProperty({ example: new Date(), required: false })
  createdAt?: Date;

  @ApiProperty({ example: new Date(), required: false })
  updatedAt?: Date;
}
