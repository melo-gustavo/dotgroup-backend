import { Module } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsController } from './enrollments.controller';
import { Enrollment } from './entities/enrollment.entity';
import { DatabaseModule } from 'src/db/db.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesModule } from 'src/courses/courses.module';
import { ClassesModule } from 'src/classes/classes.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([Enrollment]),
    UsersModule,
    CoursesModule,
    ClassesModule,
  ],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService],
})
export class EnrollmentsModule {}
