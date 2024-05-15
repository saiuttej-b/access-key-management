import { BadRequestException, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as jwt from 'jsonwebtoken';
import { SignInDto } from 'src/auth/dtos/auth.dto';
import { AuthService } from 'src/auth/services/auth.service';
import { UserRepository } from 'src/domain/repositories/user.repository';
import { User } from 'src/domain/schemas/user.schema';
import { EnvType } from 'src/utils/env';
import * as fn from 'src/utils/fn';

jest.mock('src/utils/fn', () => ({
  ...jest.requireActual('src/utils/fn'),
  compareHash: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  ...jest.requireActual('jsonwebtoken'),
  verify: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: UserRepository;
  let configService: ConfigService<EnvType>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserRepository,
          useValue: {
            findByEmailWithPassword: jest.fn(),
            findById: jest.fn(),
            existsByEmail: jest.fn(),
            instance: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepo = module.get<UserRepository>(UserRepository);
    configService = module.get<ConfigService<EnvType>>(ConfigService);

    jest.clearAllMocks();
  });

  describe('to be defined', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
      expect(userRepo).toBeDefined();
      expect(configService).toBeDefined();
    });
  });

  describe('signIn', () => {
    const reqBody: SignInDto = {
      email: 'user@gmail.com',
      password: 'password',
    };

    describe('when there is no user with the email', () => {
      beforeEach(() => {
        jest.spyOn(userRepo, 'findByEmailWithPassword').mockResolvedValue(null);
      });

      it('should call findByEmailWithPassword with the email', async () => {
        await service.signIn(reqBody).catch(() => {});

        expect(userRepo.findByEmailWithPassword).toHaveBeenCalledWith(reqBody.email);
      });

      it('should throw a BadRequestException', async () => {
        await expect(service.signIn(reqBody)).rejects.toThrow(BadRequestException);
      });

      it('should throw a BadRequestException with the message', async () => {
        await expect(service.signIn(reqBody)).rejects.toThrow(
          'There is no user account associated with this email address.',
        );
      });
    });

    describe('when the password does not match', () => {
      beforeEach(() => {
        jest.spyOn(userRepo, 'findByEmailWithPassword').mockResolvedValue({
          id: '1',
          email: reqBody.email,
          password: 'p',
        } as User);

        jest.spyOn(fn, 'compareHash').mockResolvedValue(false);
      });

      it('should call compareHash with the password', async () => {
        await service.signIn(reqBody).catch(() => {});

        expect(fn.compareHash).toHaveBeenCalledWith(reqBody.password, 'p');
      });

      it('should throw a BadRequestException', async () => {
        await expect(service.signIn(reqBody)).rejects.toThrow(BadRequestException);
      });

      it('should throw a BadRequestException with the message', async () => {
        await expect(service.signIn(reqBody)).rejects.toThrow(
          'The password you entered is incorrect.',
        );
      });
    });

    describe('when the password matches', () => {
      beforeEach(() => {
        jest.spyOn(userRepo, 'findByEmailWithPassword').mockResolvedValue({
          id: '1',
          email: reqBody.email,
          password: 'p',
        } as User);

        jest.spyOn(fn, 'compareHash').mockResolvedValue(true);
        jest.spyOn(service, 'getAuthKeys').mockReturnValue({
          jwtExpiresIn: '1d',
          jwtSecret: 'secret',
        });
      });

      it('should call compareHash with the password', async () => {
        await service.signIn(reqBody);

        expect(fn.compareHash).toHaveBeenCalledWith(reqBody.password, 'p');
      });

      it('should return an object with an accessToken', async () => {
        const response = await service.signIn(reqBody);

        expect(response).toEqual({
          accessToken: expect.any(String),
        });
      });
    });
  });

  describe('getAuthKeys', () => {
    describe('when JWT_SECRET is not defined', () => {
      beforeEach(() => {
        jest.spyOn(configService, 'get').mockReturnValue(undefined);
      });

      it('should throw an UnprocessableEntityException', async () => {
        await expect(async () => service.getAuthKeys()).rejects.toThrow(
          UnprocessableEntityException,
        );
      });

      it('should throw an UnprocessableEntityException with the message', async () => {
        await expect(async () => service.getAuthKeys()).rejects.toThrow(
          'Unable to process your request. Please try again later.',
        );
      });
    });

    describe('when JWT_EXPIRATION_TIME is not defined', () => {
      beforeEach(() => {
        jest.spyOn(configService, 'get').mockReturnValueOnce('secret');
        jest.spyOn(configService, 'get').mockReturnValueOnce(undefined);
      });

      it('should throw an UnprocessableEntityException', async () => {
        await expect(async () => service.getAuthKeys()).rejects.toThrow(
          UnprocessableEntityException,
        );
      });

      it('should throw an UnprocessableEntityException with the message', async () => {
        await expect(async () => service.getAuthKeys()).rejects.toThrow(
          'Unable to process your request. Please try again later.',
        );
      });
    });

    describe('when JWT_SECRET and JWT_EXPIRATION_TIME are defined', () => {
      beforeEach(() => {
        jest.spyOn(configService, 'get').mockReturnValueOnce('secret');
        jest.spyOn(configService, 'get').mockReturnValueOnce('1d');
      });

      it('should return an object with jwtSecret and jwtExpiresIn', () => {
        const response = service.getAuthKeys();

        expect(response).toEqual({
          jwtSecret: 'secret',
          jwtExpiresIn: '1d',
        });
      });
    });
  });

  describe('getUserFromAccessToken', () => {
    const accessToken = 'token';

    beforeEach(() => {
      jest.spyOn(service, 'getAuthKeys').mockReturnValue({
        jwtSecret: 'secret',
        jwtExpiresIn: '1d',
      });
    });

    describe('when the payload does not have an id', () => {
      beforeEach(() => {
        jest.spyOn(jwt, 'verify').mockReturnValue({} as any);
      });

      it('should return undefined', async () => {
        const response = await service.getUserFromAccessToken(accessToken);

        expect(response).toBeUndefined();
      });
    });

    describe('when the user does not exist', () => {
      beforeEach(() => {
        jest.spyOn(jwt, 'verify').mockReturnValue({ id: '1' } as any);
        jest.spyOn(userRepo, 'findById').mockResolvedValue(null);
      });

      it('should return undefined', async () => {
        const response = await service.getUserFromAccessToken(accessToken);

        expect(response).toBeUndefined();
      });

      it('should call findById with the id', async () => {
        await service.getUserFromAccessToken(accessToken);

        expect(userRepo.findById).toHaveBeenCalledWith('1');
      });
    });

    describe('when the user exists', () => {
      beforeEach(() => {
        jest.spyOn(jwt, 'verify').mockReturnValue({ id: '1' } as any);
        jest.spyOn(userRepo, 'findById').mockResolvedValue({} as User);
      });

      it('should return the user', async () => {
        const response = await service.getUserFromAccessToken(accessToken);

        expect(response).toEqual({});
      });
    });
  });

  describe('createDevAdmin', () => {
    describe('when the environment is not development', () => {
      beforeEach(() => {
        jest.spyOn(configService, 'get').mockReturnValue('production');
      });

      it('should throw a BadRequestException', async () => {
        await expect(service.createDevAdmin()).rejects.toThrow(BadRequestException);
      });
    });

    describe('when the environment is development', () => {
      beforeEach(() => {
        jest.spyOn(configService, 'get').mockReturnValue('development');
      });

      describe('when the email already exists', () => {
        beforeEach(() => {
          jest.spyOn(userRepo, 'existsByEmail').mockResolvedValue(true);
        });

        it('should return an object with a message', async () => {
          const response = await service.createDevAdmin();

          expect(response).toEqual({
            message: 'The admin account already exists.',
          });
        });
      });

      describe('when the email does not exist', () => {
        beforeEach(() => {
          jest.spyOn(userRepo, 'existsByEmail').mockResolvedValue(false);
          jest.spyOn(userRepo, 'instance').mockReturnValue({
            fullName: 'Admin Dev',
            email: '',
            isAdmin: true,
          } as User);
          jest.spyOn(userRepo, 'create').mockResolvedValue({} as User);
        });

        it('should call userRepo.instance with the user data', async () => {
          await service.createDevAdmin();

          expect(userRepo.instance).toHaveBeenCalledWith({
            fullName: 'Admin Dev',
            email: expect.any(String),
            isAdmin: true,
            password: expect.any(String),
          });
        });

        it('should call userRepo.create with the user', async () => {
          await service.createDevAdmin();

          expect(userRepo.create).toHaveBeenCalled();
        });

        it('should return an object with a message', async () => {
          const response = await service.createDevAdmin();

          expect(response).toEqual({
            message: 'The admin account has been created successfully.',
          });
        });
      });
    });
  });
});
