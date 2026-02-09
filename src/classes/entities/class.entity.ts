import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column({ nullable: true })
  createdAt: Date;

  @Column({ nullable: true })
  updatedAt: Date;
}
