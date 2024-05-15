import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response } from 'express';
import { UserAuthMiddleware } from 'src/auth/middleware/user-auth.middleware';
import { AuthService } from 'src/auth/services/auth.service';
import { User } from 'src/domain/schemas/user.schema';
import * as requestStore from 'src/utils/request-store';

jest.mock('src/utils/request-store', () => ({
  ...jest.requireActual('src/utils/request-store'),
  setUser: jest.fn(),
  setExpressRequest: jest.fn(),
}));

describe('UserAuthMiddleware', () => {
  let middleware: UserAuthMiddleware;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserAuthMiddleware,
        {
          provide: AuthService,
          useValue: {
            getUserFromAccessToken: jest.fn(),
          },
        },
      ],
    }).compile();

    middleware = module.get<UserAuthMiddleware>(UserAuthMiddleware);
    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  describe('to be defined', () => {
    it('should be defined', () => {
      expect(middleware).toBeDefined();
    });
  });

  describe('use', () => {
    const req = { headers: { authorization: '' }, originalUrl: '/api/user' };
    const res = {};
    const next = jest.fn();

    describe('when route is auth route', () => {
      const newReq = {
        ...req,
        originalUrl: '/api/auth/sign-in',
      };

      beforeEach(async () => {
        await middleware.use(newReq as Request, res as Response, next);
      });

      it('should set the express request', () => {
        expect(requestStore.setExpressRequest).toHaveBeenCalledWith(newReq);
      });

      it('should call next', () => {
        expect(next).toHaveBeenCalled();
      });

      it('should not call getUserFromAccessToken', () => {
        expect(service.getUserFromAccessToken).not.toHaveBeenCalled();
      });
    });

    describe('when auth header is not present', () => {
      it('should call next without setting user', async () => {
        await middleware.use(req as Request, res as Response, next);

        expect(next).toHaveBeenCalled();
        expect(service.getUserFromAccessToken).not.toHaveBeenCalled();
      });
    });

    describe('when auth header is present', () => {
      const req = {
        headers: { authorization: 'Bearer accessToken' },
        originalUrl: '/api/user/current-user',
      };

      describe('when user is found', () => {
        const user = { id: '1' };
        beforeEach(async () => {
          jest.spyOn(service, 'getUserFromAccessToken').mockResolvedValue(user as User);

          await middleware.use(req as Request, res as Response, next);
        });

        it('should set the express request', () => {
          expect(requestStore.setExpressRequest).toHaveBeenCalledWith(req);
        });

        it('should call getUserFromAccessToken to get user details', () => {
          expect(service.getUserFromAccessToken).toHaveBeenCalledWith('accessToken');
        });

        it('should set user', () => {
          expect(requestStore.setUser).toHaveBeenCalledWith(user);
        });

        it('should call next', () => {
          expect(next).toHaveBeenCalled();
        });
      });

      describe('when user is not found', () => {
        beforeEach(async () => {
          jest.spyOn(service, 'getUserFromAccessToken').mockResolvedValue(undefined);

          await middleware.use(req as Request, res as Response, next);
        });

        it('should set the express request', () => {
          expect(requestStore.setExpressRequest).toHaveBeenCalledWith(req);
        });

        it('should call getUserFromAccessToken to get user details', () => {
          expect(service.getUserFromAccessToken).toHaveBeenCalledWith('accessToken');
        });

        it('should not set user', () => {
          expect(requestStore.setUser).not.toHaveBeenCalled();
        });

        it('should call next', () => {
          expect(next).toHaveBeenCalled();
        });
      });
    });
  });
});
