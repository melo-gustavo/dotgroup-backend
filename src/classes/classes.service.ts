import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { Class, ClassStatus } from './entities/class.entity';
import { Repository, FindOptionsWhere, ILike, LessThan } from 'typeorm';
import { FilterClassDto } from './dto/filter-class.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { parseDateField } from '../common/common';
import { UserType, User as UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { CoursesService } from '../courses/courses.service';
import { Course as CourseEntity } from '../courses/entities/course.entity';

const validationClass = async (
  classDto: CreateClassDto | UpdateClassDto,
  findUserById: (id: number) => Promise<UserEntity>,
  findCourseById: (id: number) => Promise<CourseEntity>,
) => {
  if (classDto.teacherId === undefined || classDto.teacherId === null) {
    throw new BadRequestException('O campo "teacherId" e obrigatorio');
  }

  if (classDto.courseId === undefined || classDto.courseId === null) {
    throw new BadRequestException('O campo "courseId" e obrigatorio');
  }

  const teacher = await findUserById(classDto.teacherId);
  if (!teacher) {
    throw new NotFoundException(
      `Usuário com ID ${classDto.teacherId} não encontrado`,
    );
  }

  if (teacher.type !== UserType.TEACHER) {
    throw new BadRequestException(
      `Usuário com ID ${classDto.teacherId} não é um professor`,
    );
  }

  const course = await findCourseById(classDto.courseId);
  if (!course) {
    throw new NotFoundException(
      `Curso com ID ${classDto.courseId} nao encontrado`,
    );
  }

  if (!classDto.name?.trim()) {
    throw new BadRequestException('O campo "name" e obrigatorio');
  }

  if (!classDto.startDate) {
    throw new BadRequestException('O campo "startDate" e obrigatorio');
  }

  if (!classDto.endDate) {
    throw new BadRequestException('O campo "endDate" e obrigatorio');
  }

  const startDate = parseDateField(classDto.startDate, 'startDate');
  const endDate = parseDateField(classDto.endDate, 'endDate');

  if (endDate < startDate) {
    throw new BadRequestException(
      'O campo "endDate" nao pode ser menor que "startDate"',
    );
  }

  const createdAt =
    classDto.createdAt !== undefined && classDto.createdAt !== null
      ? parseDateField(classDto.createdAt, 'createdAt')
      : undefined;
  const updatedAt =
    classDto.updatedAt !== undefined && classDto.updatedAt !== null
      ? parseDateField(classDto.updatedAt, 'updatedAt')
      : undefined;

  return { startDate, endDate, createdAt, updatedAt };
};

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Class)
    private classesRepository: Repository<Class>,
    private usersService: UsersService,
    private coursesService: CoursesService,
  ) {}

  async create(createClassDto: CreateClassDto) {
    const { startDate, endDate, createdAt, updatedAt } = await validationClass(
      createClassDto,
      this.usersService.findOne.bind(this.usersService),
      this.coursesService.findOne.bind(this.coursesService),
    );

    const newClass = this.classesRepository.create({
      ...createClassDto,
      startDate,
      endDate,
      ...(createdAt ? { createdAt } : {}),
      ...(updatedAt ? { updatedAt } : {}),
    });

    return this.classesRepository.save(newClass);
  }

  async findAll(query: FilterClassDto) {
    const where: FindOptionsWhere<Class> = {};

    if (query.teacherId) where.teacherId = query.teacherId;
    if (query.courseId) where.courseId = query.courseId;
    if (query.name) where.name = ILike(`%${query.name.trim()}%`);
    if (query.status) where.status = query.status;

    return await this.classesRepository.find({ where });
  }

  async findOne(id: number) {
    const classEntity = await this.classesRepository.findOneBy({ id });

    if (!classEntity) {
      throw new NotFoundException(`Turma com ID ${id} nao encontrada`);
    }

    return classEntity;
  }

  async update(id: number, updateClassDto: UpdateClassDto) {
    const { startDate, endDate, createdAt, updatedAt } = await validationClass(
      updateClassDto,
      this.usersService.findOne.bind(this.usersService),
      this.coursesService.findOne.bind(this.coursesService),
    );

    const classEntity = await this.findOne(id);
    const updatedClass = this.classesRepository.merge(classEntity, {
      ...updateClassDto,
      startDate,
      endDate,
      ...(createdAt ? { createdAt } : {}),
      ...(updatedAt ? { updatedAt } : {}),
    });

    return this.classesRepository.save(updatedClass);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.classesRepository.delete(id);

    return { deleted: true };
  }

  /**
   * Finaliza turmas que passaram da data de término
   * Executa automaticamente todos os dias à meia-noite
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async finalizeExpiredClasses(): Promise<void> {
    const now = new Date();

    // Encontra todas as turmas ativas cuja data final é menor que agora
    const expiredClasses = await this.classesRepository.find({
      where: {
        status: ClassStatus.ACTIVE,
        endDate: LessThan(now),
      },
    });

    if (expiredClasses.length > 0) {
      // Atualiza todas as turmas expiradas para o status FINISHED
      await this.classesRepository.update(
        {
          status: ClassStatus.ACTIVE,
          endDate: LessThan(now),
        },
        {
          status: ClassStatus.FINISHED,
          updatedAt: now,
        },
      );

      console.log(
        `[AUTO-FINALIZE] ${expiredClasses.length} turma(s) finalizada(s) automaticamente`,
      );
    }
  }
}
