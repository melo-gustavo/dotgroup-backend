import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { Enrollment } from './entities/enrollment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { FilterEnrollmentDto } from './dto/filter-enrollment.dto';
import { User as UserEntity } from 'src/users/entities/user.entity';
import {
  Class as ClassEntity,
  ClassStatus,
} from 'src/classes/entities/class.entity';
import { Course as CourseEntity } from 'src/courses/entities/course.entity';
import { parseDateField } from '../common/common';
import { ClassesService } from 'src/classes/classes.service';
import { UsersService } from 'src/users/users.service';
import { CoursesService } from 'src/courses/courses.service';

const validationEnrollment: (
  enrollment: CreateEnrollmentDto,
  findClassById: (id: number) => Promise<ClassEntity>,
  findUserId: (id: number) => Promise<UserEntity>,
  findCourseById: (id: number) => Promise<CourseEntity>,
  findEnrollmentByUserAndCourse: (
    userId: number,
    courseId: number,
  ) => Promise<Enrollment | null>,
) => Promise<{
  createdAt: Date | undefined;
  updatedAt: Date | undefined;
}> = async (
  enrollment: CreateEnrollmentDto,
  findClassById: (id: number) => Promise<ClassEntity>,
  findUserId: (id: number) => Promise<UserEntity>,
  findCourseById: (id: number) => Promise<CourseEntity>,
  findEnrollmentByUserAndCourse: (
    userId: number,
    courseId: number,
  ) => Promise<Enrollment | null>,
) => {
  if (!enrollment.classId) {
    throw new BadRequestException('O campo "classId" é obrigatório');
  }

  const classEntity = await findClassById(enrollment.classId ?? 0);
  if (!classEntity) {
    throw new BadRequestException('A turma não existe');
  }

  // Validação 1: Verificar se turma está finalizada
  if (classEntity.status === ClassStatus.FINISHED) {
    throw new BadRequestException(
      'Não é possível matricular em uma turma finalizada',
    );
  }

  // Validação 2: Verificar datas (hoje deve estar entre startDate e endDate)
  const now = new Date();
  if (now < classEntity.startDate) {
    throw new BadRequestException(
      'A turma ainda não iniciou. Matrícula não é permitida',
    );
  }
  if (now > classEntity.endDate) {
    throw new BadRequestException(
      'A turma já foi encerrada. Matrícula não é permitida',
    );
  }

  const userEntity = await findUserId(enrollment.userId ?? 0);
  if (!userEntity || userEntity === null) {
    throw new BadRequestException('O usuário não encontrado');
  }

  const courseEntity = await findCourseById(enrollment.courseId ?? 0);
  if (!courseEntity) {
    throw new BadRequestException('O curso não existe');
  }

  // Validação 3: Verificar matrícula duplicada (mesmo usuário em duas turmas do mesmo curso)
  const existingEnrollment = await findEnrollmentByUserAndCourse(
    enrollment.userId ?? 0,
    enrollment.courseId ?? 0,
  );
  if (existingEnrollment) {
    throw new BadRequestException(
      'Usuário já está matriculado em outra turma deste curso',
    );
  }

  const createdAt =
    enrollment.createdAt !== undefined && enrollment.createdAt !== null
      ? parseDateField(enrollment.createdAt, 'createdAt')
      : undefined;
  const updatedAt =
    enrollment.updatedAt !== undefined && enrollment.updatedAt !== null
      ? parseDateField(enrollment.updatedAt, 'updatedAt')
      : undefined;

  return {
    createdAt: createdAt ?? undefined,
    updatedAt: updatedAt ?? undefined,
  };
};

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private enrollmentRepository: Repository<Enrollment>,
    private classesService: ClassesService,
    private usersService: UsersService,
    private coursesService: CoursesService,
  ) {}

  async create(createEnrollmentDto: CreateEnrollmentDto) {
    const { createdAt, updatedAt } = await validationEnrollment(
      createEnrollmentDto,
      this.classesService.findOne.bind(this.classesService),
      this.usersService.findOne.bind(this.usersService),
      this.coursesService.findOne.bind(this.coursesService),
      this.findEnrollmentByUserAndCourse.bind(this),
    );

    const enrollment = this.enrollmentRepository.create({
      ...createEnrollmentDto,
      ...(createdAt ? { createdAt } : {}),
      ...(updatedAt ? { updatedAt } : {}),
    });

    return this.enrollmentRepository.save(enrollment);
  }

  private async findEnrollmentByUserAndCourse(
    userId: number,
    courseId: number,
  ): Promise<Enrollment | null> {
    return this.enrollmentRepository.findOne({
      where: { userId, courseId },
    });
  }

  findAll(query: FilterEnrollmentDto) {
    const where: FindOptionsWhere<Enrollment> = {};

    if (query.classId) where.classId = query.classId;
    if (query.userId) where.userId = query.userId;
    if (query.courseId) where.courseId = query.courseId;

    return this.enrollmentRepository.find({ where });
  }

  async findAllDetailed(query: FilterEnrollmentDto) {
    const queryBuilder = this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .leftJoin('class', 'class', 'class.id = enrollment.classId')
      .leftJoin('course', 'course', 'course.id = enrollment.courseId')
      .select([
        'enrollment.id AS id',
        'course.title AS "courseTitle"',
        'class.name AS "className"',
        'class.startDate AS "startDate"',
        'class.endDate AS "endDate"',
        'class.status AS status',
      ]);

    if (query.classId) {
      queryBuilder.andWhere('enrollment.classId = :classId', {
        classId: query.classId,
      });
    }
    if (query.userId) {
      queryBuilder.andWhere('enrollment.userId = :userId', {
        userId: query.userId,
      });
    }
    if (query.courseId) {
      queryBuilder.andWhere('enrollment.courseId = :courseId', {
        courseId: query.courseId,
      });
    }

    return queryBuilder.getRawMany();
  }

  async findOne(id: number) {
    const enrollment = await this.enrollmentRepository.findOneBy({ id });

    if (!enrollment) {
      throw new NotFoundException('A matrícula não existe');
    }

    return enrollment;
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.enrollmentRepository.delete(id);

    return { deleted: true };
  }
}
