import { BadRequestException } from '@nestjs/common';

export function parseDateField(
  value: Date | string,
  field: 'createdAt' | 'updatedAt',
) {
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new BadRequestException(`O campo "${field}" é inválido`);
  }
  return parsed;
}
