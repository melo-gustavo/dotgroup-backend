import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { UserType } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'Gustavo Melo' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'email@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: UserType.STUDENT,
  })
  @IsEnum(UserType)
  @IsNotEmpty()
  type: UserType;

  @ApiProperty({
    example: new Date(),
    required: false,
  })
  @Type(() => Date)
  @IsOptional()
  createdAt?: Date;

  @ApiProperty({
    example: new Date(),
    required: false,
  })
  @Type(() => Date)
  @IsOptional()
  updatedAt?: Date;
}
