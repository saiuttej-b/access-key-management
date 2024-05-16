import { Test, TestingModule } from '@nestjs/testing';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { User } from 'src/domain/schemas/user.schema';
import { UsersController } from 'src/users/controllers/users.controller';
import { UserCreateDto, UserGetDto } from 'src/users/dtos/user.dto';
import { UsersService } from 'src/users/services/users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            createUser: jest.fn(),
            findUsers: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  describe('to be defined', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
      expect(service).toBeDefined();
    });
  });

  describe('createUser', () => {
    const reqBody: UserCreateDto = {
      email: 'user@gmail.com',
      fullName: 'User',
      password: 'Password@123',
    };

    describe('should call service.createUser with the reqBody', () => {
      it('should call service.createUser with the reqBody', async () => {
        jest.spyOn(service, 'createUser').mockResolvedValue({} as User);
        await controller.createUser(reqBody);

        expect(service.createUser).toHaveBeenCalledWith(reqBody);
      });
    });

    describe('input validations', () => {
      describe('email', () => {
        describe('when the email is empty', () => {
          it('should throw an error', async () => {
            const body = new UserCreateDto();
            Object.assign(body, reqBody);
            body.email = '';

            const errors = await validate(body);

            expect(errors).toHaveLength(1);

            const error = errors.find((e) => e.property === 'email');
            expect(error?.constraints).toMatchObject({
              isNotEmpty: 'email should not be empty',
            });
          });
        });

        describe('when the email is not an email', () => {
          it('should throw an error', async () => {
            const body = new UserCreateDto();
            Object.assign(body, reqBody);
            body.email = 'invalid-email';

            const errors = await validate(body);

            expect(errors).toHaveLength(1);

            const error = errors.find((e) => e.property === 'email');
            expect(error?.constraints).toMatchObject({
              isEmail: 'email must be a valid email address',
            });
          });
        });

        describe('valid email should be transformed', () => {
          it('should be trimmed and lowercased', () => {
            const email = '   SampLe@GMaiL.COm ';

            const value = plainToClass(UserCreateDto, { ...reqBody, email });

            expect(value.email).toEqual(email.trim().toLowerCase());
          });
        });
      });

      describe('fullName', () => {
        describe('when the fullName is empty', () => {
          it('should throw an error', async () => {
            const body = new UserCreateDto();
            Object.assign(body, reqBody);
            body.fullName = '';

            const errors = await validate(body);

            expect(errors).toHaveLength(1);

            const error = errors.find((e) => e.property === 'fullName');
            expect(error?.constraints).toMatchObject({
              isNotEmpty: 'fullName should not be empty',
            });
          });
        });

        describe('valid fullName should be transformed', () => {
          it('should be trimmed', () => {
            const fullName = '   Sample Name ';

            const value = plainToClass(UserCreateDto, { ...reqBody, fullName });

            expect(value.fullName).toEqual(fullName.trim());
          });
        });
      });

      describe('password', () => {
        describe('when the password is empty', () => {
          it('should throw an error', async () => {
            const body = new UserCreateDto();
            Object.assign(body, reqBody);
            body.password = '';

            const errors = await validate(body);

            expect(errors).toHaveLength(1);

            const error = errors.find((e) => e.property === 'password');
            expect(error?.constraints).toMatchObject({
              isNotEmpty: 'password should not be empty',
            });
          });
        });

        describe('when the password is not a strong password', () => {
          it('should throw an error', async () => {
            const body = new UserCreateDto();
            Object.assign(body, reqBody);
            body.password = 'weak@password';

            const errors = await validate(body);

            expect(errors).toHaveLength(1);

            const error = errors.find((e) => e.property === 'password');
            expect(error?.constraints).toMatchObject({
              isStrongPassword: 'password is not strong enough',
            });
          });
        });

        describe('when the password is a strong password', () => {
          it('should not throw an error', async () => {
            const body = new UserCreateDto();
            Object.assign(body, reqBody);
            body.password = 'Strong@password100';

            const errors = await validate(body);

            expect(errors).toHaveLength(0);
          });
        });
      });
    });
  });

  describe('findUsers', () => {
    const query: UserGetDto = {
      search: 'user',
      limit: 10,
      skip: 0,
    };

    describe('should call service.findUsers with the query', () => {
      it('should call service.findUsers with the query', async () => {
        jest.spyOn(service, 'findUsers').mockResolvedValue({ count: 0, users: [] });
        await controller.findUsers(query);

        expect(service.findUsers).toHaveBeenCalledWith(query);
      });
    });

    describe('input validations', () => {
      describe('limit', () => {
        describe('when limit is not provided', () => {
          it('should not throw an error', async () => {
            const body = new UserGetDto();
            Object.assign(body, { ...query, limit: null });

            const errors = await validate(body);

            expect(errors).toHaveLength(0);
          });

          describe('when limit is less than 1', () => {
            it('should throw an error', async () => {
              const body = new UserGetDto();
              Object.assign(body, { ...query, limit: 0 });

              const errors = await validate(body);

              expect(errors).toHaveLength(1);

              const error = errors.find((e) => e.property === 'limit');
              expect(error?.constraints).toMatchObject({
                min: expect.any(String),
              });
            });
          });
        });
      });

      describe('skip', () => {
        describe('when skip is not provided', () => {
          it('should not throw an error', async () => {
            const body = new UserGetDto();
            Object.assign(body, { ...query, skip: null });

            const errors = await validate(body);

            expect(errors).toHaveLength(0);
          });

          describe('when skip is less than 0', () => {
            it('should throw an error', async () => {
              const body = new UserGetDto();
              Object.assign(body, { ...query, skip: -1 });

              const errors = await validate(body);

              expect(errors).toHaveLength(1);

              const error = errors.find((e) => e.property === 'skip');
              expect(error?.constraints).toMatchObject({
                min: expect.any(String),
              });
            });
          });
        });
      });
    });
  });
});
