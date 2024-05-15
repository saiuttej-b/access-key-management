import { Test, TestingModule } from '@nestjs/testing';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { AuthController } from 'src/auth/controllers/auth.controller';
import { SignInDto } from 'src/auth/dtos/auth.dto';
import { AuthService } from 'src/auth/services/auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: {
            signIn: jest.fn(),
            createDevAdmin: jest.fn(),
          },
        },
      ],
      controllers: [AuthController],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  describe('to be defined', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
      expect(service).toBeDefined();
    });
  });

  describe('signIn', () => {
    const reqBody: SignInDto = {
      email: 'user@gmail.com',
      password: 'password',
    };

    describe('should call service.signIn', () => {
      beforeEach(() => {
        jest.spyOn(service, 'signIn').mockResolvedValue({
          accessToken: 'accessToken',
        });
      });

      it('should call service.signIn', async () => {
        await controller.signIn(reqBody);

        expect(service.signIn).toHaveBeenCalledWith(reqBody);
      });
    });

    describe('input validation', () => {
      it('should throw error if email is not provided', async () => {
        const reqBody = new SignInDto();
        reqBody.email = '';
        reqBody.password = 'password';

        await validate(reqBody).then((errors) => {
          const emailError = errors.find((error) => error.property === 'email');

          expect(emailError).toBeDefined();
          expect(emailError?.constraints?.isNotEmpty).toEqual('email should not be empty');
          expect(emailError?.constraints?.isEmail).toEqual('email must be a valid email address');
        });
      });

      it('should throw error if password is not provided', async () => {
        const reqBody = new SignInDto();
        reqBody.email = 'sample@gmail.com';
        reqBody.password = '';

        await validate(reqBody).then((errors) => {
          const passwordError = errors.find((error) => error.property === 'password');

          expect(passwordError).toBeDefined();
          expect(passwordError?.constraints?.isNotEmpty).toEqual('password should not be empty');
        });
      });

      it('should transform email to lowercase and trim', async () => {
        const email = ' SamLpe@GmaIl.CoM    ';
        const value = plainToClass(SignInDto, { ...reqBody, email: email });

        expect(value.email).toEqual(email.toLowerCase().trim());
      });
    });
  });

  describe('createDevAdmin', () => {
    it('should call service.createDevAdmin', async () => {
      jest.spyOn(service, 'createDevAdmin').mockResolvedValue({
        message: 'Dev admin created',
      });

      await controller.createDevAdmin();

      expect(service.createDevAdmin).toHaveBeenCalled();
    });
  });
});
