import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Course } from '../../courses/entities/course.entity';
import { User } from '../../users/entities/user.entity';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';

export enum ClassStatus {
  PLANNED = 'PLANNED',
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED',
}

@Entity()
export class Class {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  teacherId: number;

  @Column({ nullable: false })
  courseId: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  startDate: Date;

  @Column({ nullable: false })
  endDate: Date;

  @Column({
    type: 'enum',
    enum: ClassStatus,
    nullable: false,
    default: ClassStatus.PLANNED,
  })
  status: ClassStatus;

  @Column({ nullable: true })
  createdAt: Date;

  @Column({ nullable: true })
  updatedAt: Date;

  @ManyToOne(() => Course, (course) => course.classes, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @ManyToOne(() => User, (user) => user.classesAsTeacher, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'teacherId' })
  teacher: User;

  @OneToMany(() => Enrollment, (enrollment) => enrollment.class)
  enrollments: Enrollment[];
}
