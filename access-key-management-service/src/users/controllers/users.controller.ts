import { Body, Controller, Post } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/user-auth.guard';
import { UserCreateDto } from '../dtos/user.dto';
import { UsersService } from '../services/users.service';

@JwtAuthGuard()
@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Post()
  createUser(@Body() reqBody: UserCreateDto) {
    return this.service.createUser(reqBody);
  }
}
