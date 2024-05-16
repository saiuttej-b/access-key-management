import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/user-auth.guard';
import { UserCreateDto, UserGetDto } from '../dtos/user.dto';
import { UsersService } from '../services/users.service';

@JwtAuthGuard()
@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Post()
  createUser(@Body() reqBody: UserCreateDto) {
    return this.service.createUser(reqBody);
  }

  @Get()
  findUsers(@Query() query: UserGetDto) {
    return this.service.findUsers(query);
  }
}
