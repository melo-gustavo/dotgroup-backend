import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum CourseType {
  INOVATION = 'INOVATION',
  TECNOLOGY = 'TECNOLOGY',
  MARKETING = 'MARKETING',
  ENTREPRENEURSHIP = 'ENTREPRENEURSHIP',
  AGROBUSINESS = 'AGROBUSINESS',
}

Entity();
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  description: string;

  @Column({ type: 'enum', enum: CourseType, nullable: false })
  type: CourseType;

  @Column({ nullable: true })
  createdAt: Date;

  @Column({ nullable: true })
  updatedAt: Date;
}
