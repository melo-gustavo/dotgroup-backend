import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Class } from '../../classes/entities/class.entity';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';

export enum CourseType {
  INNOVATION = 'INNOVATION',
  TECHNOLOGY = 'TECHNOLOGY',
  MARKETING = 'MARKETING',
  ENTREPRENEURSHIP = 'ENTREPRENEURSHIP',
  AGROBUSINESS = 'AGROBUSINESS',
}

@Entity()
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
  image_url: string;

  @Column({ nullable: true })
  createdAt: Date;

  @Column({ nullable: true })
  updatedAt: Date;

  @OneToMany(() => Class, (classEntity) => classEntity.course)
  classes: Class[];

  @OneToMany(() => Enrollment, (enrollment) => enrollment.course)
  enrollments: Enrollment[];
}
