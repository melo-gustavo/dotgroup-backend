import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './db/db.module';
import { CoursesModule } from './courses/courses.module';
import { ClassesModule } from './classes/classes.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnrollmentsModule } from './enrollments/enrollments.module';
@Module({
  imports: [
    UsersModule,
    DatabaseModule,
    CoursesModule,
    ClassesModule,
    EnrollmentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
