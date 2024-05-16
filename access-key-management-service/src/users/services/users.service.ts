import { BadRequestException, Injectable } from '@nestjs/common';
import { UserRepository } from 'src/domain/repositories/user.repository';
import { hashValue } from 'src/utils/fn';
import { UserCreateDto, UserGetDto } from '../dtos/user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly userRepo: UserRepository) {}

  async createUser(reqBody: UserCreateDto) {
    const emailExists = await this.userRepo.existsByEmail(reqBody.email);
    if (emailExists) {
      throw new BadRequestException('There is already a user with this email');
    }

    const user = this.userRepo.instance(reqBody);
    user.password = await hashValue(reqBody.password);
    return this.userRepo.create(user);
  }

  async findUsers(query: UserGetDto) {
    return this.userRepo.find(query);
  }
}
