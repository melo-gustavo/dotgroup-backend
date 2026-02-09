import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateClassDto } from './create-class.dto';

export class UpdateClassDto extends PartialType(CreateClassDto) {
  @ApiProperty({ example: 1 })
  id: number;
}
