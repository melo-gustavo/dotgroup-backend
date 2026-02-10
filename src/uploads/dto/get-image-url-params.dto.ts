import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetImageUrlParamsDto {
  @ApiProperty({
    description: 'Nome do objeto salvo no bucket',
  })
  @IsString()
  @IsNotEmpty()
  objectName: string;
}
