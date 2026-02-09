import { ApiProperty } from '@nestjs/swagger';
import { UserType } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'Gustavo Melo' })
  name: string;

  @ApiProperty({
    example: 'email@gmail.com',
  })
  email: string;

  @ApiProperty({
    example: UserType.STUDENT,
  })
  type: UserType;

  @ApiProperty({
    example: new Date(),
    required: false,
  })
  createdAt?: Date;

  @ApiProperty({
    example: new Date(),
    required: false,
  })
  updatedAt?: Date;
}
