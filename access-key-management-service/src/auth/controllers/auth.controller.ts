import { Body, Controller, Post } from '@nestjs/common';
import { SignInDto } from '../dtos/auth.dto';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('sign-in')
  signIn(@Body() reqBody: SignInDto) {
    return this.service.signIn(reqBody);
  }

  @Post('dev-admin')
  createDevAdmin() {
    return this.service.createDevAdmin();
  }
}
