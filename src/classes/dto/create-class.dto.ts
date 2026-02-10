import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ClassStatus } from '../entities/class.entity';

export class CreateClassDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  teacherId: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  courseId: number;

  @ApiProperty({ example: 'Class Name' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: new Date() })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  startDate: Date;

  @ApiProperty({ example: new Date() })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  endDate: Date;

  @ApiProperty({ example: ClassStatus.ACTIVE })
  @IsEnum(ClassStatus)
  @IsOptional()
  status?: ClassStatus;

  @ApiProperty({ example: new Date(), required: false })
  @Type(() => Date)
  @IsOptional()
  createdAt?: Date;

  @ApiProperty({ example: new Date(), required: false })
  @Type(() => Date)
  @IsOptional()
  updatedAt?: Date;
}
