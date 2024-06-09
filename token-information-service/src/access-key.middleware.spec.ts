import { HttpException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response } from 'express';
import { AccessKeyMiddleware } from './access-key.middleware';
import { AccessKey, AccessKeyRepository } from './domain/repositories/access-key.repository';
import { AccessLogRepository } from './domain/repositories/access-log.repository';
import { AccessLog } from './domain/schemas/access-log.schema';
import { generateId } from './utils/fn';
import * as requestStore from './utils/request-store';

jest.mock('./utils/request-store', () => ({
  ...jest.requireActual('./utils/request-store'),
  setExpressRequest: jest.fn(),
  setAccessKeyDetails: jest.fn(),
}));

describe('AccessKeyMiddleware', () => {
  let middleware: AccessKeyMiddleware;
  let accessKeyRepo: AccessKeyRepository;
  let accessLogRepo: AccessLogRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccessKeyMiddleware,
        {
          provide: AccessKeyRepository,
          useValue: {
            findByKey: jest.fn(),
          },
        },
        {
          provide: AccessLogRepository,
          useValue: {
            instance: jest.fn(),
            create: jest.fn(),
            countSuccessRequests: jest.fn(),
          },
        },
      ],
    }).compile();

    middleware = module.get<AccessKeyMiddleware>(AccessKeyMiddleware);
    accessKeyRepo = module.get<AccessKeyRepository>(AccessKeyRepository);
    accessLogRepo = module.get<AccessLogRepository>(AccessLogRepository);

    jest.clearAllMocks();
  });

  describe('to be defined', () => {
    it('should be defined', () => {
      expect(middleware).toBeDefined();
      expect(accessKeyRepo).toBeDefined();
      expect(accessLogRepo).toBeDefined();
    });
  });

  describe('use', () => {
    const req: Request = {
      headers: {
        'x-access-key': 'access-key',
      },
    } as any;
    const res: Response = {
      setHeader: jest.fn(),
    } as any;
    const next = jest.fn();

    beforeEach(() => {
      jest.spyOn(requestStore, 'setExpressRequest').mockReturnValue();
    });

    describe('when access key is not provided', () => {
      const req = {
        headers: {},
      } as Request;

      it('should throw an UnauthorizedException', async () => {
        await expect(middleware.use(req, res, next)).rejects.toThrow(UnauthorizedException);
      });
    });

    describe('when access key is invalid', () => {
      beforeEach(() => {
        jest.spyOn(accessKeyRepo, 'findByKey').mockResolvedValue(null);
      });

      it('should call findByKey with key', async () => {
        await expect(middleware.use(req, res, next)).rejects.toThrow(UnauthorizedException);
        expect(accessKeyRepo.findByKey).toHaveBeenCalledWith('access-key');
      });

      it('should throw an UnauthorizedException', async () => {
        await expect(middleware.use(req, res, next)).rejects.toThrow(UnauthorizedException);
      });

      it('should throw an UnauthorizedException with message', async () => {
        await expect(middleware.use(req, res, next)).rejects.toThrow('Invalid access key');
      });
    });

    describe('when access key is valid', () => {
      const accessKey: AccessKey = {
        key: generateId(),
        createdAt: new Date(),
        disabled: false,
        rateLimit: 10,
        updatedAt: new Date(),
        userId: generateId(),
      };

      beforeEach(() => {
        jest.spyOn(accessLogRepo, 'instance').mockReturnValue({
          key: accessKey.key,
          timestamp: new Date(),
          rateLimited: false,
          success: true,
        } as AccessLog);

        jest.spyOn(accessLogRepo, 'create').mockResolvedValue();
      });

      describe('when access key is disabled', () => {
        beforeEach(() => {
          jest.spyOn(accessKeyRepo, 'findByKey').mockResolvedValue({
            ...accessKey,
            disabled: true,
          });
        });

        it('should throw an UnauthorizedException', async () => {
          await expect(middleware.use(req, res, next)).rejects.toThrow(UnauthorizedException);
        });

        it('should throw an UnauthorizedException with message', async () => {
          await expect(middleware.use(req, res, next)).rejects.toThrow('Access key disabled');
        });

        it('should set log success to false', async () => {
          await middleware.use(req, res, next).catch(() => {});

          expect(accessLogRepo.create).toHaveBeenCalledWith({
            key: accessKey.key,
            rateLimited: false,
            success: false,
            timestamp: expect.any(Date),
          });
        });
      });

      describe('when access key is expired', () => {
        beforeEach(() => {
          jest.spyOn(accessKeyRepo, 'findByKey').mockResolvedValue({
            ...accessKey,
            expiresAt: new Date('2021-01-01'),
          });
        });

        it('should throw an UnauthorizedException', async () => {
          await expect(middleware.use(req, res, next)).rejects.toThrow(UnauthorizedException);
        });

        it('should throw an UnauthorizedException with message', async () => {
          await expect(middleware.use(req, res, next)).rejects.toThrow('Access key expired');
        });

        it('should set log success to false', async () => {
          await middleware.use(req, res, next).catch(() => {});

          expect(accessLogRepo.create).toHaveBeenCalledWith({
            key: accessKey.key,
            timestamp: expect.any(Date),
            success: false,
            rateLimited: false,
          });
        });
      });

      describe('when rate limit is exceeded', () => {
        beforeEach(() => {
          jest.spyOn(accessKeyRepo, 'findByKey').mockResolvedValue(accessKey);
          jest.spyOn(accessLogRepo, 'countSuccessRequests').mockResolvedValue(10);
        });

        it('should throw HttpException', async () => {
          await expect(middleware.use(req, res, next)).rejects.toThrow(HttpException);
        });

        it('should set log success to false', async () => {
          await middleware.use(req, res, next).catch(() => {});

          expect(accessLogRepo.create).toHaveBeenCalledWith({
            key: accessKey.key,
            timestamp: expect.any(Date),
            success: false,
            rateLimited: true,
          });
        });
      });

      describe('when everything is fine', () => {
        beforeEach(() => {
          jest.spyOn(accessKeyRepo, 'findByKey').mockResolvedValue(accessKey);
          jest.spyOn(accessLogRepo, 'countSuccessRequests').mockResolvedValue(9);
          jest.spyOn(requestStore, 'setAccessKeyDetails').mockReturnValue();
        });

        it('should call next', async () => {
          await middleware.use(req, res, next);
          expect(next).toHaveBeenCalled();
        });

        it('should set log success to true', async () => {
          await middleware.use(req, res, next).catch(() => {});

          expect(accessLogRepo.create).toHaveBeenCalledWith({
            key: accessKey.key,
            timestamp: expect.any(Date),
            success: true,
            rateLimited: false,
          });
        });
      });
    });
  });
});
