import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as redisStore from 'cache-manager-redis-store';
import { AccessKeysModule } from './access-keys/access-keys.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DomainModule } from './domain/domain.module';
import { UsersModule } from './users/users.module';
import { EnvSchema, EnvType } from './utils/env';
import { mongoConfig } from './utils/mongoose-fn';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => {
        return EnvSchema.parse(config);
      },
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvType>) => {
        const config = mongoConfig(configService);
        return {
          uri: config.MONGO_URI,
          autoIndex: config.MONGO_AUTO_INDEX,
        };
      },
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvType>) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST'),
        port: configService.get('REDIS_PORT'),
        ttl: 0,
      }),
    }),
    DomainModule,
    AuthModule,
    AccessKeysModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
