import { Module, Provider } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServiceClientsModule } from 'src/service-clients/service-clients.module';
import { MongoDbAccessLogRepository } from './mongodb-repositories/mongodb-access-log.repository';
import { AccessKeyRepository } from './repositories/access-key.repository';
import { AccessLogRepository } from './repositories/access-log.repository';
import { AccessLog, AccessLogSchema } from './schemas/access-log.schema';
import { AccessKeyServiceRepository } from './service-repositories/access-key-service.repository';

const repos: Provider[] = [
  {
    provide: AccessLogRepository,
    useClass: MongoDbAccessLogRepository,
  },
  {
    provide: AccessKeyRepository,
    useClass: AccessKeyServiceRepository,
  },
];

@Module({
  imports: [
    ServiceClientsModule,
    MongooseModule.forFeature([{ name: AccessLog.name, schema: AccessLogSchema }]),
  ],
  providers: [...repos],
  exports: [...repos],
})
export class DomainModule {}
