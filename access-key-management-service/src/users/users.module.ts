import { Module } from '@nestjs/common';
import { DomainModule } from 'src/domain/domain.module';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';

@Module({
  imports: [DomainModule],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
