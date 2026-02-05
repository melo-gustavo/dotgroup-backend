import { CourseType } from '../entities/course.entity';

export class CreateCourseDto {
  title: string;
  description: string;
  type: CourseType;
  createdAt?: Date;
  updatedAt?: Date;
}
