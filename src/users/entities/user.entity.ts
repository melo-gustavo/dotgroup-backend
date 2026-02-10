import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Class } from '../../classes/entities/class.entity';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';

export enum UserType {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({
    type: 'enum',
    enum: UserType,
    nullable: false,
    default: UserType.STUDENT,
  })
  type: UserType;

  @Column({ nullable: true })
  createdAt: Date;

  @Column({ nullable: true })
  updatedAt: Date;

  @OneToMany(() => Class, (classEntity) => classEntity.teacher)
  classesAsTeacher: Class[];

  @OneToMany(() => Enrollment, (enrollment) => enrollment.user)
  enrollments: Enrollment[];
}
