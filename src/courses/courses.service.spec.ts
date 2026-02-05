import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { Repository } from 'typeorm';
import { Course, CourseType } from './entities/course.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('CoursesService', () => {
  let service: CoursesService;
  let repository: jest.Mocked<Repository<Course>>;

  const repositoryMock = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    merge: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        {
          provide: getRepositoryToken(Course),
          useValue: repositoryMock,
        },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
    repository = module.get(getRepositoryToken(Course));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a course', async () => {
    const createdAt = new Date('2024-01-01T00:00:00.000Z');
    const updatedAt = new Date('2024-01-02T00:00:00.000Z');
    const dto = {
      title: 'TypeScript Basics',
      description: 'Learn TypeScript fundamentals',
      type: CourseType.TECNOLOGY,
      createdAt,
      updatedAt,
    };
    const course = { id: 1, ...dto };

    repository.create.mockReturnValue(course as Course);
    repository.save.mockResolvedValue(course as Course);

    await expect(service.create(dto)).resolves.toEqual(course);
    expect(repository.create).toHaveBeenCalled();
    expect(repository.save).toHaveBeenCalledWith(course);
  });

  it('should find all courses', async () => {
    const courses = [
      {
        id: 1,
        title: 'Course 1',
        description: 'Description 1',
        type: CourseType.TECNOLOGY,
      },
      {
        id: 2,
        title: 'Course 2',
        description: 'Description 2',
        type: CourseType.MARKETING,
      },
    ];

    repository.find.mockResolvedValue(courses as Course[]);

    await expect(service.findAll()).resolves.toEqual(courses);
    expect(repository.find).toHaveBeenCalled();
  });

  it('should find one course by id', async () => {
    const course = {
      id: 1,
      title: 'TypeScript Basics',
      description: 'Learn TypeScript fundamentals',
      type: CourseType.TECNOLOGY,
    };

    repository.findOneBy.mockResolvedValue(course as Course);

    await expect(service.findOne(1)).resolves.toEqual(course);
    expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
  });

  it('should update a course', async () => {
    const dto = {
      title: 'Updated Course',
      description: 'Updated Description',
      type: CourseType.INOVATION,
    };
    const course = {
      id: 1,
      title: 'Old Title',
      description: 'Old Description',
      type: CourseType.TECNOLOGY,
    };
    const updatedCourse = { ...course, ...dto };

    repository.findOneBy.mockResolvedValue(course as Course);
    repository.merge.mockReturnValue(updatedCourse as Course);
    repository.save.mockResolvedValue(updatedCourse as Course);

    await expect(service.update(1, dto)).resolves.toEqual(updatedCourse);
    expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    expect(repository.merge).toHaveBeenCalled();
    expect(repository.save).toHaveBeenCalledWith(updatedCourse);
  });

  it('should remove a course', async () => {
    const course = {
      id: 1,
      title: 'Course to Remove',
      description: 'Description',
      type: CourseType.TECNOLOGY,
    };

    repository.findOneBy.mockResolvedValue(course as Course);
    repository.remove.mockResolvedValue(course as Course);

    await expect(service.remove(1)).resolves.toEqual({ deleted: true });
    expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    expect(repository.remove).toHaveBeenCalledWith(course);
  });

  it('should throw when course is not found', async () => {
    repository.findOneBy.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });

  it('should throw when title is missing on create', async () => {
    await expect(
      service.create({
        title: '',
        description: 'Some description',
        type: CourseType.TECNOLOGY,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw when description is missing on create', async () => {
    await expect(
      service.create({
        title: 'Some title',
        description: '',
        type: CourseType.TECNOLOGY,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw when type is missing on create', async () => {
    await expect(
      service.create({
        title: 'Some title',
        description: 'Some description',
        type: null,
      } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw when type is invalid on create', async () => {
    await expect(
      service.create({
        title: 'Some title',
        description: 'Some description',
        type: 'INVALID',
      } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw when title is missing on update', async () => {
    await expect(
      service.update(1, {
        title: '',
        description: 'Some description',
        type: CourseType.TECNOLOGY,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw when description is missing on update', async () => {
    await expect(
      service.update(1, {
        title: 'Some title',
        description: '',
        type: CourseType.TECNOLOGY,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw when type is missing on update', async () => {
    await expect(
      service.update(1, {
        title: 'Some title',
        description: 'Some description',
        type: null,
      } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw when type is invalid on update', async () => {
    await expect(
      service.update(1, {
        title: 'Some title',
        description: 'Some description',
        type: 'INVALID',
      } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw when course is not found on update', async () => {
    repository.findOneBy.mockResolvedValue(null);

    await expect(
      service.update(999, {
        title: 'Some title',
        description: 'Some description',
        type: CourseType.TECNOLOGY,
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw when course is not found on remove', async () => {
    repository.findOneBy.mockResolvedValue(null);

    await expect(service.remove(999)).rejects.toThrow(NotFoundException);
  });
});
