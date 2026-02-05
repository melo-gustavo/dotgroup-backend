import { UserType } from '../entities/user.entity';

export class CreateUserDto {
  name: string;
  email: string;
  type: UserType;
  createdAt?: Date;
  updatedAt?: Date;
}
