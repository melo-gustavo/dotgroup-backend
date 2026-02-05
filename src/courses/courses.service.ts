import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course, CourseType } from './entities/course.entity';
import { Repository } from 'typeorm';
import { parseDateField } from '../common/common';

const validationCourse: (course: CreateCourseDto | UpdateCourseDto) => {
  createdAt: any;
  updatedAt: any;
} = (course: CreateCourseDto | UpdateCourseDto) => {
  if (!course.title?.trim()) {
    throw new BadRequestException('O campo "title" é obrigatório');
  }

  if (!course.description?.trim()) {
    throw new BadRequestException('O campo "description" é obrigatório');
  }

  if (!course.type) {
    throw new BadRequestException('O campo "type" é obrigatório');
  }

  if (!Object.values(CourseType).includes(course.type)) {
    throw new BadRequestException('O campo "type" é inválido');
  }

  const createdAt =
    course.createdAt !== undefined && course.createdAt !== null
      ? parseDateField(course.createdAt, 'createdAt')
      : undefined;
  const updatedAt =
    course.updatedAt !== undefined && course.updatedAt !== null
      ? parseDateField(course.updatedAt, 'updatedAt')
      : undefined;

  return { createdAt, updatedAt };
};

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  async create(createCourseDto: CreateCourseDto) {
    const { createdAt, updatedAt } = validationCourse(createCourseDto);

    const course = this.courseRepository.create({
      ...createCourseDto,
      ...(createdAt ? { createdAt } : {}),
      ...(updatedAt ? { updatedAt } : {}),
    });
    return await this.courseRepository.save(course);
  }

  async findAll() {
    return await this.courseRepository.find();
  }

  async findOne(id: number) {
    const course = await this.courseRepository.findOneBy({ id });

    if (!course) {
      throw new NotFoundException(`Curso com ID ${id} não encontrado`);
    }

    return course;
  }

  async update(id: number, updateCourseDto: UpdateCourseDto) {
    const { createdAt, updatedAt } = validationCourse(updateCourseDto);

    const course = await this.findOne(id);

    if (!course) {
      throw new NotFoundException(`Curso com ID ${id} não encontrado`);
    }

    const updatedCourse = this.courseRepository.merge(course, {
      id: id,
      ...updateCourseDto,
      ...(createdAt ? { createdAt } : {}),
      ...(updatedAt ? { updatedAt } : {}),
    });

    return await this.courseRepository.save(updatedCourse);
  }

  async remove(id: number) {
    const course = await this.findOne(id);

    if (!course) {
      throw new NotFoundException(`Curso com ID ${id} não encontrado`);
    }

    await this.courseRepository.remove(course);
    return { deleted: true };
  }
}
