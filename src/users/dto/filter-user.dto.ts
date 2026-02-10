import { IsEnum, IsOptional } from 'class-validator';
import { UserType } from '../entities/user.entity';

export class UserFilterDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  email?: string;

  @IsOptional()
  @IsEnum(UserType)
  type?: UserType;
}
