import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './db/db.module';
import { CoursesModule } from './courses/courses.module';
import { ClassesModule } from './classes/classes.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { UploadsModule } from './uploads/uploads.module';
@Module({
  imports: [
    ScheduleModule.forRoot(),
    UsersModule,
    DatabaseModule,
    CoursesModule,
    ClassesModule,
    EnrollmentsModule,
    UploadsModule,
  ],
})
export class AppModule {}
