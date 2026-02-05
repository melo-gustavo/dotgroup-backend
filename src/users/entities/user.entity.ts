import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column({ nullable: false })
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
}
