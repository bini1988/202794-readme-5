import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appPostsConfig } from './app-posts.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [appPostsConfig],
      envFilePath: 'apps/posts/posts.env',
    })
  ],
})
export class ConfigPostsModule {}
