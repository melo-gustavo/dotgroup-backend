import { ApiProperty } from '@nestjs/swagger';

export class CreateClassDto {
  @ApiProperty({ example: 1 })
  teacherId: number;

  @ApiProperty({ example: 1 })
  courseId: number;

  @ApiProperty({ example: 'Class Name' })
  name: string;

  @ApiProperty({ example: new Date() })
  startDate: Date;

  @ApiProperty({ example: new Date() })
  endDate: Date;

  @ApiProperty({ example: new Date(), required: false })
  createdAt?: Date;

  @ApiProperty({ example: new Date(), required: false })
  updatedAt?: Date;
}
