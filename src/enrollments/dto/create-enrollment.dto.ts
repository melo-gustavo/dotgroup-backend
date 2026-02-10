import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEnrollmentDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  classId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  courseId: number;

  @ApiProperty({ example: new Date(), required: false })
  @Type(() => Date)
  @IsOptional()
  createdAt?: Date;

  @ApiProperty({ example: new Date(), required: false })
  @Type(() => Date)
  @IsOptional()
  updatedAt?: Date;
}
