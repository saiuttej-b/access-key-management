import { UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard, UserAuthGuard } from 'src/auth/guards/user-auth.guard';
import { User } from 'src/domain/schemas/user.schema';
import * as requestStore from 'src/utils/request-store';

jest.mock('src/utils/request-store', () => ({
  ...jest.requireActual('src/utils/request-store'),
  getUserOrNot: jest.fn(),
}));

describe('UserAuthGuard', () => {
  let guard: UserAuthGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserAuthGuard,
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<UserAuthGuard>(UserAuthGuard);
    reflector = module.get<Reflector>(Reflector);

    jest.clearAllMocks();
  });

  describe('to be defined', () => {
    it('should be defined', () => {
      expect(guard).toBeDefined();
    });
  });

  describe('JwtAuthGuard', () => {
    it('should return true', () => {
      const result = JwtAuthGuard();

      expect(result).toBeDefined();
    });
  });

  describe('canActivate', () => {
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    };

    describe('when methodCheck and classCheck are false', () => {
      it('should return true', () => {
        const result = guard.canActivate(context as any);

        expect(result).toBe(true);
      });
    });

    describe('when the authentication is required', () => {
      beforeEach(() => {
        jest.spyOn(reflector, 'get').mockReturnValue(true);
      });

      it('when user is not found', () => {
        jest.spyOn(requestStore, 'getUserOrNot').mockReturnValue(undefined);

        expect(() => guard.canActivate(context as any)).toThrow(UnauthorizedException);
      });

      it('when user is not admin', () => {
        jest.spyOn(requestStore, 'getUserOrNot').mockReturnValue({ isAdmin: false } as User);

        expect(() => guard.canActivate(context as any)).toThrow(UnauthorizedException);
      });

      it('should return true', () => {
        jest.spyOn(requestStore, 'getUserOrNot').mockReturnValue({ isAdmin: true } as User);

        const result = guard.canActivate(context as any);

        expect(result).toBe(true);
      });
    });
  });
});
