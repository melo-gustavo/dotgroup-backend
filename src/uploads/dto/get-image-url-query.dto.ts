import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetImageUrlQueryDto {
  @ApiPropertyOptional({
    type: Number,
    description: 'Tempo de expiracao da URL em segundos',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  expiresInSeconds?: number;
}
