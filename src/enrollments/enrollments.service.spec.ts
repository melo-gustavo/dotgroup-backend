import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { Repository } from 'typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ClassesService } from '../classes/classes.service';
import { UsersService } from '../users/users.service';
import { CoursesService } from '../courses/courses.service';
import { Class as ClassEntity } from '../classes/entities/class.entity';
import { User as UserEntity } from '../users/entities/user.entity';
import { Course as CourseEntity } from '../courses/entities/course.entity';

describe('EnrollmentsService', () => {
  let service: EnrollmentsService;
  let repository: jest.Mocked<Repository<Enrollment>>;
  let classesService: jest.Mocked<ClassesService>;
  let usersService: jest.Mocked<UsersService>;
  let coursesService: jest.Mocked<CoursesService>;

  const repositoryMock = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    merge: jest.fn(),
    delete: jest.fn(),
  };

  const classesServiceMock = {
    findOne: jest.fn(),
  };

  const usersServiceMock = {
    findOne: jest.fn(),
  };

  const coursesServiceMock = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrollmentsService,
        {
          provide: getRepositoryToken(Enrollment),
          useValue: repositoryMock,
        },
        {
          provide: ClassesService,
          useValue: classesServiceMock,
        },
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
        {
          provide: CoursesService,
          useValue: coursesServiceMock,
        },
      ],
    }).compile();

    service = module.get<EnrollmentsService>(EnrollmentsService);
    repository = module.get(getRepositoryToken(Enrollment));
    classesService = module.get(ClassesService);
    usersService = module.get(UsersService);
    coursesService = module.get(CoursesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an enrollment with valid data', async () => {
      const createdAt = new Date('2024-01-01T00:00:00.000Z');
      const updatedAt = new Date('2024-01-02T00:00:00.000Z');
      const dto = {
        classId: 1,
        userId: 1,
        courseId: 1,
        createdAt,
        updatedAt,
      };
      const enrollment = { id: 1, ...dto };

      classesService.findOne.mockResolvedValue({
        id: 1,
        status: 'disponível',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
      } as ClassEntity);
      usersService.findOne.mockResolvedValue({ id: 1 } as UserEntity);
      coursesService.findOne.mockResolvedValue({ id: 1 } as CourseEntity);
      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue(enrollment as Enrollment);
      repository.save.mockResolvedValue(enrollment as Enrollment);

      await expect(service.create(dto)).resolves.toEqual(enrollment);
      expect(classesService.findOne).toHaveBeenCalledWith(1);
      expect(usersService.findOne).toHaveBeenCalledWith(1);
      expect(coursesService.findOne).toHaveBeenCalledWith(1);
      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalledWith(enrollment);
    });

    it('should create an enrollment without optional dates', async () => {
      const dto = {
        classId: 1,
        userId: 1,
        courseId: 1,
      };
      const enrollment = { id: 1, ...dto };

      classesService.findOne.mockResolvedValue({
        id: 1,
        status: 'disponível',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
      } as ClassEntity);
      usersService.findOne.mockResolvedValue({ id: 1 } as UserEntity);
      coursesService.findOne.mockResolvedValue({ id: 1 } as CourseEntity);
      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue(enrollment as Enrollment);
      repository.save.mockResolvedValue(enrollment as Enrollment);

      await expect(service.create(dto)).resolves.toEqual(enrollment);
      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalledWith(enrollment);
    });

    it('should throw when classId is missing', async () => {
      const dto = {
        classId: null as any,
        userId: 1,
        courseId: 1,
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow(
        'O campo "classId" é obrigatório',
      );
    });

    it('should throw when classId is undefined', async () => {
      const dto = {
        classId: undefined as any,
        userId: 1,
        courseId: 1,
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow(
        'O campo "classId" é obrigatório',
      );
    });

    it('should throw when class does not exist', async () => {
      const dto = {
        classId: 999,
        userId: 1,
        courseId: 1,
      };

      classesService.findOne.mockResolvedValue(null as any);

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow('A turma não existe');
    });

    it('should throw when user does not exist', async () => {
      const dto = {
        classId: 1,
        userId: 999,
        courseId: 1,
      };

      classesService.findOne.mockResolvedValue({
        id: 1,
        status: 'disponível',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
      } as ClassEntity);
      usersService.findOne.mockResolvedValue(null as any);

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow(
        'O usuário não encontrado',
      );
    });

    it('should throw when course does not exist', async () => {
      const dto = {
        classId: 1,
        userId: 1,
        courseId: 999,
      };

      classesService.findOne.mockResolvedValue({
        id: 1,
        status: 'disponível',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
      } as ClassEntity);
      usersService.findOne.mockResolvedValue({ id: 1 } as UserEntity);
      coursesService.findOne.mockResolvedValue(null as any);

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow('O curso não existe');
    });

    it('should throw when createdAt is invalid', async () => {
      const dto = {
        classId: 1,
        userId: 1,
        courseId: 1,
        createdAt: 'invalid-date' as any,
      };

      classesService.findOne.mockResolvedValue({
        id: 1,
        status: 'disponível',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
      } as ClassEntity);
      usersService.findOne.mockResolvedValue({ id: 1 } as UserEntity);
      coursesService.findOne.mockResolvedValue({ id: 1 } as CourseEntity);
      repository.findOne.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow(
        'O campo "createdAt" é inválido',
      );
    });

    it('should throw when updatedAt is invalid', async () => {
      const dto = {
        classId: 1,
        userId: 1,
        courseId: 1,
        updatedAt: 'invalid-date' as any,
      };

      classesService.findOne.mockResolvedValue({
        id: 1,
        status: 'disponível',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
      } as ClassEntity);
      usersService.findOne.mockResolvedValue({ id: 1 } as UserEntity);
      coursesService.findOne.mockResolvedValue({ id: 1 } as CourseEntity);
      repository.findOne.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow(
        'O campo "updatedAt" é inválido',
      );
    });
  });

  describe('findAll', () => {
    it('should return all enrollments', async () => {
      const enrollments = [
        { id: 1, classId: 1, userId: 1, courseId: 1 },
        { id: 2, classId: 2, userId: 2, courseId: 2 },
      ];

      repository.find.mockResolvedValue(enrollments as Enrollment[]);

      await expect(service.findAll({})).resolves.toEqual(enrollments);
      expect(repository.find).toHaveBeenCalled();
    });

    it('should return empty array when no enrollments exist', async () => {
      repository.find.mockResolvedValue([]);

      await expect(service.findAll({})).resolves.toEqual([]);
      expect(repository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return an enrollment when it exists', async () => {
      const enrollment = { id: 1, classId: 1, userId: 1, courseId: 1 };

      repository.findOneBy.mockResolvedValue(enrollment as Enrollment);

      await expect(service.findOne(1)).resolves.toEqual(enrollment);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('should throw NotFoundException when enrollment does not exist', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'A matrícula não existe',
      );
    });
  });

  describe('remove', () => {
    it('should remove an enrollment successfully', async () => {
      const enrollment = { id: 1, classId: 1, userId: 1, courseId: 1 };

      repository.findOneBy.mockResolvedValue(enrollment as Enrollment);
      repository.delete.mockResolvedValue({ affected: 1 } as any);

      await expect(service.remove(1)).resolves.toEqual({ deleted: true });
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(repository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw when trying to remove non-existent enrollment', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      await expect(service.remove(999)).rejects.toThrow(
        'A matrícula não existe',
      );
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });
});
