import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { DomainModule } from 'src/domain/domain.module';
import { AuthController } from './controllers/auth.controller';
import { UserAuthGuard } from './guards/user-auth.guard';
import { UserAuthMiddleware } from './middleware/user-auth.middleware';
import { AuthService } from './services/auth.service';

@Module({
  imports: [DomainModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: UserAuthGuard,
    },
  ],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserAuthMiddleware).forRoutes('*');
  }
}
