import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from 'src/domain/repositories/user.repository';
import { User } from 'src/domain/schemas/user.schema';
import { UserCreateDto, UserGetDto } from 'src/users/dtos/user.dto';
import { UsersService } from 'src/users/services/users.service';

describe('UsersService', () => {
  let service: UsersService;
  let userRepo: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserRepository,
          useValue: {
            existsByEmail: jest.fn(),
            instance: jest.fn(),
            create: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepo = module.get<UserRepository>(UserRepository);

    jest.clearAllMocks();
  });

  describe('to be defined', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
      expect(userRepo).toBeDefined();
    });
  });

  describe('createUser', () => {
    const reqBody: UserCreateDto = {
      email: 'user@gmail.com',
      fullName: 'User',
      password: 'Password@123',
    };

    describe('when there is already a user with the email', () => {
      beforeEach(() => {
        (userRepo.existsByEmail as jest.Mock).mockResolvedValue(true);
      });

      it('should call existsByEmail with the email', async () => {
        await service.createUser(reqBody).catch(() => {});

        expect(userRepo.existsByEmail).toHaveBeenCalledWith(reqBody.email);
      });

      it('should throw a BadRequestException', async () => {
        await expect(service.createUser(reqBody)).rejects.toThrow(BadRequestException);
      });

      it('should throw a BadRequestException with the message', async () => {
        await expect(service.createUser(reqBody)).rejects.toThrow(
          'There is already a user with this email',
        );
      });
    });

    describe('when there is no user with the email', () => {
      let user: User;
      beforeEach(async () => {
        jest.spyOn(userRepo, 'existsByEmail').mockResolvedValue(false);
        jest.spyOn(userRepo, 'instance').mockReturnValue(reqBody as User);
        jest.spyOn(userRepo, 'create').mockResolvedValue({ id: 'id', ...reqBody } as User);

        user = await service.createUser(reqBody);
      });

      it('should call userRepo.instance with the reqBody', () => {
        expect(userRepo.instance).toHaveBeenCalledWith(reqBody);
      });

      it('should call userRepo.create with the user', () => {
        expect(userRepo.create).toHaveBeenCalledWith(reqBody);
      });

      it('should return the user', () => {
        expect(user).toBeDefined();
        expect(user.id).toBe('id');
      });
    });
  });

  describe('findUsers', () => {
    const query: UserGetDto = {};

    it('should call userRepo.find with query', async () => {
      await service.findUsers(query);

      expect(userRepo.find).toHaveBeenCalledWith(query);
    });

    it('should return users', async () => {
      const users = [{}] as User[];

      jest.spyOn(userRepo, 'find').mockResolvedValue({
        count: users.length,
        users: users,
      });

      const response = await service.findUsers(query);
      expect(response.count).toBe(users.length);
      expect(response.users).toEqual(users);
    });
  });
});
