import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { Repository } from 'typeorm';
import { User, UserType } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Repository<User>>;

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
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: repositoryMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(User));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    const createdAt = new Date('2024-01-01T00:00:00.000Z');
    const updatedAt = new Date('2024-01-02T00:00:00.000Z');
    const dto = {
      name: 'Ana',
      email: 'ana@test.com',
      type: UserType.STUDENT,
      createdAt,
      updatedAt,
    };
    const user = { id: 1, ...dto };

    repository.create.mockReturnValue(user as User);
    repository.save.mockResolvedValue(user as User);

    await expect(service.create(dto)).resolves.toEqual(user);
    expect(repository.create).toHaveBeenCalledWith(dto);
    expect(repository.save).toHaveBeenCalledWith(user);
  });

  it('should update a user', async () => {
    const dto = { name: 'Ana', email: 'ana@test.com', type: UserType.STUDENT };
    const user = { id: 1, ...dto };
    const updatedAt = new Date('2024-02-01T00:00:00.000Z');

    repository.findOneBy.mockResolvedValue(user as User);
    repository.merge.mockReturnValue({
      ...user,
      name: 'Ana Updated',
      type: UserType.TEACHER,
      updatedAt,
    } as User);
    repository.save.mockResolvedValue({
      ...user,
      name: 'Ana Updated',
      type: UserType.TEACHER,
      updatedAt,
    } as User);

    await expect(
      service.update(1, {
        name: 'Ana Updated',
        email: 'ana@test.com',
        type: UserType.TEACHER,
        updatedAt,
      }),
    ).resolves.toEqual({
      ...user,
      name: 'Ana Updated',
      type: UserType.TEACHER,
      updatedAt,
    });
  });

  it('should throw when user is not found', async () => {
    repository.findOneBy.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });

  it('should throw when email is missing on create', async () => {
    await expect(
      service.create({
        name: 'Ana',
        email: '',
        type: UserType.STUDENT,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw when name is missing on create', async () => {
    await expect(
      service.create({
        name: '',
        email: 'ana@test.com',
        type: UserType.STUDENT,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw when name is missing on update', async () => {
    await expect(
      service.update(1, {
        name: '',
        email: 'ana@test.com',
        type: UserType.STUDENT,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw when email is missing on update', async () => {
    await expect(
      service.update(1, {
        name: 'Ana',
        email: '',
        type: UserType.STUDENT,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw when user is not found on update', async () => {
    repository.findOneBy.mockResolvedValue(null);

    await expect(
      service.update(999, {
        name: 'Ana',
        email: 'ana@test.com',
        type: UserType.STUDENT,
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw when type is missing on create', async () => {
    await expect(
      service.create({ name: 'Ana', email: 'ana@test.com', type: null } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw when type is invalid on create', async () => {
    await expect(
      service.create({
        name: 'Ana',
        email: 'ana@test.com',
        type: 'INVALID',
      } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw when type is missing on update', async () => {
    await expect(
      service.update(1, { name: 'Ana', email: 'ana@test.com' } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw when type is invalid on update', async () => {
    await expect(
      service.update(1, {
        name: 'Ana',
        email: 'ana@test.com',
        type: 'INVALID',
      } as any),
    ).rejects.toThrow(BadRequestException);
  });
});
