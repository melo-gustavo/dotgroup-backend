import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { Repository } from 'typeorm';
import { Class } from './entities/class.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';
import { UserType } from '../users/entities/user.entity';
import { CoursesService } from '../courses/courses.service';

describe('ClassesService', () => {
  let service: ClassesService;
  let repository: jest.Mocked<Repository<Class>>;
  let usersService: { findOne: jest.Mock };
  let coursesService: { findOne: jest.Mock };

  const repositoryMock = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    merge: jest.fn(),
    delete: jest.fn(),
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
        ClassesService,
        {
          provide: getRepositoryToken(Class),
          useValue: repositoryMock,
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

    service = module.get<ClassesService>(ClassesService);
    repository = module.get(getRepositoryToken(Class));
    usersService = module.get(UsersService);
    coursesService = module.get(CoursesService);
    jest.clearAllMocks();
    usersService.findOne.mockImplementation(async (id: number) => ({
      id,
      type: UserType.TEACHER,
    }));
    coursesService.findOne.mockImplementation(async (id: number) => ({
      id,
    }));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a class', async () => {
      const dto = {
        teacherId: 1,
        courseId: 1,
        name: 'Turma A',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-01'),
      };
      const classEntity = { id: 1, ...dto };

      repository.create.mockReturnValue(classEntity as Class);
      repository.save.mockResolvedValue(classEntity as Class);

      await expect(service.create(dto)).resolves.toEqual(classEntity);
      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalledWith(classEntity);
    });

    it('should throw when teacherId is missing on create', async () => {
      await expect(
        service.create({
          teacherId: null,
          courseId: 1,
          name: 'Turma A',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-06-01'),
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when teacherId is undefined on create', async () => {
      await expect(
        service.create({
          courseId: 1,
          name: 'Turma A',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-06-01'),
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when courseId is missing on create', async () => {
      await expect(
        service.create({
          teacherId: 1,
          courseId: null,
          name: 'Turma A',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-06-01'),
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when courseId is undefined on create', async () => {
      await expect(
        service.create({
          teacherId: 1,
          name: 'Turma A',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-06-01'),
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when name is empty on create', async () => {
      await expect(
        service.create({
          teacherId: 1,
          courseId: 1,
          name: '',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-06-01'),
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when name is whitespace on create', async () => {
      await expect(
        service.create({
          teacherId: 1,
          courseId: 1,
          name: '   ',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-06-01'),
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when startDate is invalid on create', async () => {
      await expect(
        service.create({
          teacherId: 1,
          courseId: 1,
          name: 'Turma A',
          startDate: 'invalid-date' as any,
          endDate: new Date('2024-06-01'),
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when endDate is invalid on create', async () => {
      await expect(
        service.create({
          teacherId: 1,
          courseId: 1,
          name: 'Turma A',
          startDate: new Date('2024-01-01'),
          endDate: 'invalid-date' as any,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should find all classes', async () => {
      const classes = [
        {
          id: 1,
          teacherId: 1,
          courseId: 1,
          name: 'Turma A',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-06-01'),
        },
        {
          id: 2,
          teacherId: 2,
          courseId: 2,
          name: 'Turma B',
          startDate: new Date('2024-02-01'),
          endDate: new Date('2024-07-01'),
        },
      ];

      repository.find.mockResolvedValue(classes as Class[]);

      await expect(service.findAll()).resolves.toEqual(classes);
      expect(repository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should find one class by id', async () => {
      const classEntity = {
        id: 1,
        teacherId: 1,
        courseId: 1,
        name: 'Turma A',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-01'),
      };

      repository.findOneBy.mockResolvedValue(classEntity as Class);

      await expect(service.findOne(1)).resolves.toEqual(classEntity);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('should throw when class is not found', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a class', async () => {
      const dto = {
        teacherId: 1,
        courseId: 1,
        name: 'Turma A Atualizada',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-06-15'),
      };
      const classEntity = {
        id: 1,
        teacherId: 1,
        courseId: 1,
        name: 'Turma A',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-01'),
      };
      const updatedClass = { ...classEntity, ...dto };

      repository.findOneBy.mockResolvedValue(classEntity as Class);
      repository.merge.mockReturnValue(updatedClass as Class);
      repository.save.mockResolvedValue(updatedClass as Class);

      await expect(service.update(1, dto)).resolves.toEqual(updatedClass);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(repository.merge).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalledWith(updatedClass);
    });

    it('should throw when teacherId is missing on update', async () => {
      await expect(
        service.update(1, {
          teacherId: null,
          courseId: 1,
          name: 'Turma A',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-06-01'),
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when teacherId is undefined on update', async () => {
      await expect(
        service.update(1, {
          courseId: 1,
          name: 'Turma A',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-06-01'),
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when courseId is missing on update', async () => {
      await expect(
        service.update(1, {
          teacherId: 1,
          courseId: null,
          name: 'Turma A',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-06-01'),
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when courseId is undefined on update', async () => {
      await expect(
        service.update(1, {
          teacherId: 1,
          name: 'Turma A',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-06-01'),
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when name is empty on update', async () => {
      await expect(
        service.update(1, {
          teacherId: 1,
          courseId: 1,
          name: '',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-06-01'),
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when name is whitespace on update', async () => {
      await expect(
        service.update(1, {
          teacherId: 1,
          courseId: 1,
          name: '   ',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-06-01'),
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when startDate is invalid on update', async () => {
      await expect(
        service.update(1, {
          teacherId: 1,
          courseId: 1,
          name: 'Turma A',
          startDate: 'invalid-date' as any,
          endDate: new Date('2024-06-01'),
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when endDate is invalid on update', async () => {
      await expect(
        service.update(1, {
          teacherId: 1,
          courseId: 1,
          name: 'Turma A',
          startDate: new Date('2024-01-01'),
          endDate: 'invalid-date' as any,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when class is not found on update', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(
        service.update(999, {
          teacherId: 1,
          courseId: 1,
          name: 'Turma A',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-06-01'),
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a class', async () => {
      const classEntity = {
        id: 1,
        teacherId: 1,
        courseId: 1,
        name: 'Turma A',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-01'),
      };

      repository.findOneBy.mockResolvedValue(classEntity as Class);
      repository.delete.mockResolvedValue({ affected: 1 } as any);

      await expect(service.remove(1)).resolves.toEqual({ deleted: true });
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(repository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw when class is not found on remove', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
