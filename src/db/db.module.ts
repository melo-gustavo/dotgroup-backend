import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { database, hostDb, passwordDb, portDb, usernameDb } from '../constants';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: hostDb,
      port: portDb,
      username: usernameDb,
      password: passwordDb,
      database: database,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
