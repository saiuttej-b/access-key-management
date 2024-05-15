import {
  BadRequestException,
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sign, verify } from 'jsonwebtoken';
import { UserRepository } from 'src/domain/repositories/user.repository';
import { EnvType, Environments } from 'src/utils/env';
import { compareHash, hashValue } from 'src/utils/fn';
import { SignInDto } from '../dtos/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger: Logger = new Logger(AuthService.name);

  constructor(
    private readonly userRepo: UserRepository,
    private readonly configService: ConfigService<EnvType>,
  ) {}

  async signIn(reqBody: SignInDto) {
    const user = await this.userRepo.findByEmailWithPassword(reqBody.email);
    if (!user) {
      throw new BadRequestException('There is no user account associated with this email address.');
    }

    const isPasswordMatched = await compareHash(reqBody.password, user.password);
    if (!isPasswordMatched) {
      throw new BadRequestException('The password you entered is incorrect.');
    }

    return this.generateToken(user.id);
  }

  private generateToken(id: string) {
    const payload = { id, createdAt: new Date().toISOString() };

    const { jwtSecret, jwtExpiresIn } = this.getAuthKeys();

    const token = sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });
    return {
      accessToken: token,
    };
  }

  getAuthKeys() {
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      this.logger.error('JWT_SECRET is not defined in the environment variables.');
      throw new UnprocessableEntityException(
        'Unable to process your request. Please try again later.',
      );
    }

    const jwtExpiresIn = this.configService.get<string>('JWT_EXPIRATION_TIME');
    if (!jwtExpiresIn) {
      this.logger.error('JWT_EXPIRATION_TIME is not defined in the environment variables.');
      throw new UnprocessableEntityException(
        'Unable to process your request. Please try again later.',
      );
    }

    return { jwtSecret, jwtExpiresIn };
  }

  async getUserFromAccessToken(accessToken: string) {
    const { jwtSecret } = this.getAuthKeys();

    let id: string | null = null;

    try {
      const payload = verify(accessToken, jwtSecret) as { id: string; createdAt: string };

      id = payload.id;
    } catch (error) {}

    if (!id) return;

    const user = await this.userRepo.findById(id);
    if (!user) return;

    return user;
  }

  async createDevAdmin() {
    const environment = this.configService.get<string>('PROJECT_ENVIRONMENT');
    if (environment !== Environments.DEVELOPMENT) {
      throw new BadRequestException(
        'This feature is only available in the development environment.',
      );
    }

    const email = 'admindev@gmail.com';
    const password = 'admin-dev';

    const isEmailExists = await this.userRepo.existsByEmail(email);
    if (isEmailExists) {
      return {
        message: 'The admin account already exists.',
      };
    }

    const user = this.userRepo.instance({
      fullName: 'Admin Dev',
      email,
      password,
      isAdmin: true,
    });
    user.password = await hashValue(password);
    await this.userRepo.create(user);

    return {
      message: 'The admin account has been created successfully.',
    };
  }
}
