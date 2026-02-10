import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course, CourseType } from './entities/course.entity';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { parseDateField } from '../common/common';
import { CourseFilterDto } from './dto/filter-course.dto';

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

  async findAll(query: CourseFilterDto) {
    const where: FindOptionsWhere<Course> = {};

    if (query.title) where.title = Like(`%${query.title}%`);
    if (query.type) where.type = query.type;

    return await this.courseRepository.find({ where });
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

    const updatedCourse = this.courseRepository.merge(course, {
      ...updateCourseDto,
      ...(createdAt ? { createdAt } : {}),
      ...(updatedAt ? { updatedAt } : {}),
    });

    return await this.courseRepository.save(updatedCourse);
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.courseRepository.delete(id);

    return { deleted: true };
  }
}
