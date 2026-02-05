import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User, UserType } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  private parseDateField(
    value: Date | string,
    field: 'createdAt' | 'updatedAt',
  ) {
    const parsed = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException(`O campo "${field}" é inválido`);
    }
    return parsed;
  }

  async create(createUserDto: CreateUserDto) {
    if (!createUserDto.name?.trim()) {
      throw new BadRequestException('O campo "name" é obrigatório');
    }

    if (!createUserDto.email?.trim()) {
      throw new BadRequestException('O campo "email" é obrigatório');
    }

    if (!createUserDto.type) {
      throw new BadRequestException('O campo "type" é obrigatório');
    }

    if (!Object.values(UserType).includes(createUserDto.type)) {
      throw new BadRequestException('O campo "type" é inválido');
    }

    const createdAt =
      createUserDto.createdAt !== undefined && createUserDto.createdAt !== null
        ? this.parseDateField(createUserDto.createdAt, 'createdAt')
        : undefined;
    const updatedAt =
      createUserDto.updatedAt !== undefined && createUserDto.updatedAt !== null
        ? this.parseDateField(createUserDto.updatedAt, 'updatedAt')
        : undefined;

    const user = this.userRepository.create({
      ...createUserDto,
      ...(createdAt ? { createdAt } : {}),
      ...(updatedAt ? { updatedAt } : {}),
    });
    return this.userRepository.save(user);
  }

  findAll() {
    return this.userRepository.find();
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(`Usuário não encontrado com id ${id}`);
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    if (!updateUserDto.name?.trim()) {
      throw new BadRequestException('O campo "name" não pode ser vazio');
    }

    if (!updateUserDto.email?.trim()) {
      throw new BadRequestException('O campo "email" não pode ser vazio');
    }

    if (!updateUserDto.type) {
      throw new BadRequestException('O campo "type" não pode ser vazio');
    }

    if (!Object.values(UserType).includes(updateUserDto.type)) {
      throw new BadRequestException('O campo "type" é inválido');
    }

    const createdAt =
      updateUserDto.createdAt !== undefined && updateUserDto.createdAt !== null
        ? this.parseDateField(updateUserDto.createdAt, 'createdAt')
        : undefined;
    const updatedAt =
      updateUserDto.updatedAt !== undefined && updateUserDto.updatedAt !== null
        ? this.parseDateField(updateUserDto.updatedAt, 'updatedAt')
        : undefined;

    const user = await this.findOne(id);
    const updatedUser = this.userRepository.merge(user, {
      ...updateUserDto,
      ...(createdAt ? { createdAt } : {}),
      ...(updatedAt ? { updatedAt } : {}),
    });
    return this.userRepository.save(updatedUser);
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
    return { deleted: true };
  }
}
