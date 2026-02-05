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
import { parseDateField } from '../common/common';

const validationUser: (user: CreateUserDto | UpdateUserDto) => {
  createdAt: any;
  updatedAt: any;
} = (user: CreateUserDto | UpdateUserDto) => {
  if (!user.name?.trim()) {
    throw new BadRequestException('O campo "name" é obrigatório');
  }

  if (!user.email?.trim()) {
    throw new BadRequestException('O campo "email" é obrigatório');
  }

  if (!user.type) {
    throw new BadRequestException('O campo "type" é obrigatório');
  }

  if (!Object.values(UserType).includes(user.type)) {
    throw new BadRequestException('O campo "type" é inválido');
  }

  const createdAt =
    user.createdAt !== undefined && user.createdAt !== null
      ? parseDateField(user.createdAt, 'createdAt')
      : undefined;
  const updatedAt =
    user.updatedAt !== undefined && user.updatedAt !== null
      ? parseDateField(user.updatedAt, 'updatedAt')
      : undefined;

  return { createdAt, updatedAt };
};

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { createdAt, updatedAt } = validationUser(createUserDto);
    const user = this.userRepository.create({
      ...createUserDto,
      ...(createdAt ? { createdAt } : {}),
      ...(updatedAt ? { updatedAt } : {}),
    });
    return this.userRepository.save(user);
  }

  async findAll() {
    return await this.userRepository.find();
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(`Usuário não encontrado com id ${id}`);
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const { createdAt, updatedAt } = validationUser(updateUserDto);

    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    const updatedUser = this.userRepository.merge(user, {
      ...updateUserDto,
      ...(createdAt ? { createdAt } : {}),
      ...(updatedAt ? { updatedAt } : {}),
    });
    return this.userRepository.save(updatedUser);
  }

  async remove(id: number) {
    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    await this.userRepository.remove(user);
    return { deleted: true };
  }
}
