import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EnvType } from 'src/utils/env';
import {
  ACCESS_KEY_MANAGEMENT_SERVICE,
  ServiceClientsService,
} from './services/service-clients.service';

@Module({
  imports: [
    ClientsModule.registerAsync({
      clients: [
        {
          name: ACCESS_KEY_MANAGEMENT_SERVICE,
          inject: [ConfigService],
          useFactory: (configService: ConfigService<EnvType>) => ({
            transport: Transport.REDIS,
            options: {
              host: configService.get('REDIS_HOST'),
              port: configService.get('REDIS_PORT'),
            },
          }),
        },
      ],
    }),
  ],
  providers: [ServiceClientsService],
  exports: [ServiceClientsService],
})
export class ServiceClientsModule {}
