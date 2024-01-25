import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { rabbitConfig } from '@project/libs/config/rabbit';
import { appUsersConfig } from './app-users.config';
import { dbUsersConfig } from './db-users.config';
import { jwtUsersConfig } from './jwt-users.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [
        appUsersConfig,
        dbUsersConfig,
        jwtUsersConfig,
        rabbitConfig,
      ],
      envFilePath: 'apps/users/users.env',
    })
  ],
})
export class ConfigUsersModule {}
