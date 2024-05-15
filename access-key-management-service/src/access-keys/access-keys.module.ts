import { Module } from '@nestjs/common';
import { DomainModule } from 'src/domain/domain.module';
import { AccessKeysController } from './controllers/access-keys.controller';
import { UserAccessKeysController } from './controllers/user-access-keys.controller';
import { AccessKeysService } from './services/access-keys.service';

@Module({
  imports: [DomainModule],
  providers: [AccessKeysService],
  controllers: [AccessKeysController, UserAccessKeysController],
})
export class AccessKeysModule {}
