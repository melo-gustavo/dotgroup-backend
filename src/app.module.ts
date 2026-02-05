import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './db/db.module';
import { CoursesModule } from './courses/courses.module';
@Module({
  imports: [UsersModule, DatabaseModule, CoursesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
