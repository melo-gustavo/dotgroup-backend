import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Class } from '../../classes/entities/class.entity';
import { User } from '../../users/entities/user.entity';
import { Course } from '../../courses/entities/course.entity';

@Entity()
export class Enrollment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  classId: number;

  @Column({ nullable: false })
  userId: number;

  @Column({ nullable: false })
  courseId: number;

  @Column({ nullable: true })
  createdAt: Date;

  @Column({ nullable: true })
  updatedAt: Date;

  @ManyToOne(() => Class, (classEntity) => classEntity.enrollments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'classId' })
  class: Class;

  @ManyToOne(() => User, (user) => user.enrollments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Course, (course) => course.enrollments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'courseId' })
  course: Course;
}
