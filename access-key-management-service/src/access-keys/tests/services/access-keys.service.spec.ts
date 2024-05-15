import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { NotFoundException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { Cache } from 'cache-manager';
import {
  AccessKeyCreateDto,
  AccessKeyUpdateDto,
  AccessKeysGetDto,
} from 'src/access-keys/dtos/access-keys.dto';
import { AccessKeysService } from 'src/access-keys/services/access-keys.service';
import { AccessKeyRepository } from 'src/domain/repositories/access-key.repository';
import { UserRepository } from 'src/domain/repositories/user.repository';
import { AccessKey } from 'src/domain/schemas/access-key.schema';
import { generateId } from 'src/utils/fn';

describe('AccessKeysService', () => {
  let service: AccessKeysService;
  let accessKeyRepo: AccessKeyRepository;
  let userRepo: UserRepository;
  let cacheService: Cache;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccessKeysService,
        {
          provide: UserRepository,
          useValue: {
            existsById: jest.fn(),
          },
        },
        {
          provide: AccessKeyRepository,
          useValue: {
            instance: jest.fn(),
            create: jest.fn(),
            findByKey: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            set: jest.fn(),
            del: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AccessKeysService>(AccessKeysService);
    accessKeyRepo = module.get<AccessKeyRepository>(AccessKeyRepository);
    userRepo = module.get<UserRepository>(UserRepository);
    cacheService = module.get<Cache>(CACHE_MANAGER);

    jest.clearAllMocks();
  });

  describe('to be defined', () => {
    it('should be initialized', () => {
      expect(service).toBeDefined();
      expect(accessKeyRepo).toBeDefined();
      expect(userRepo).toBeDefined();
      expect(cacheService).toBeDefined();
    });
  });

  describe('createAccesskey', () => {
    const reqBody: AccessKeyCreateDto = {
      userId: generateId(),
      disabled: false,
      rateLimit: 100,
      expiresAt: new Date(),
    };

    describe('when user does not exist', () => {
      beforeEach(() => {
        jest.spyOn(userRepo, 'existsById').mockResolvedValue(false);
      });

      it('should call userRepo.existsById with userId', async () => {
        await service.createAccesskey(reqBody).catch(() => {});

        expect(userRepo.existsById).toHaveBeenCalledWith(reqBody.userId);
      });

      it('should throw NotFoundException', async () => {
        await expect(service.createAccesskey(reqBody)).rejects.toThrow(NotFoundException);
      });

      it('should throw NotFoundException with message', async () => {
        await expect(service.createAccesskey(reqBody)).rejects.toThrow(
          'User not found to create access key',
        );
      });
    });

    describe('when user exists', () => {
      let response: AccessKey;

      beforeEach(async () => {
        jest.spyOn(userRepo, 'existsById').mockResolvedValue(true);
        jest.spyOn(accessKeyRepo, 'instance').mockReturnValue({
          key: generateId(),
          ...reqBody,
        } as AccessKey);
        jest.spyOn(accessKeyRepo, 'create').mockResolvedValue({
          key: generateId(),
          ...reqBody,
        } as AccessKey);

        response = await service.createAccesskey(reqBody);
      });

      it('should call userRepo.instance with reqBody', () => {
        expect(accessKeyRepo.instance).toHaveBeenCalledWith(reqBody);
      });

      it('should call accessKeyRepo.create with accessKey', () => {
        expect(accessKeyRepo.create).toHaveBeenCalledWith({
          key: expect.any(String),
          ...reqBody,
        });
      });

      it('should return accessKey', () => {
        expect(response).toEqual({
          key: expect.any(String),
          ...reqBody,
        });
      });
    });
  });

  describe('updateAccessKey', () => {
    const reqBody: AccessKeyUpdateDto = {
      disabled: true,
      rateLimit: 200,
      expiresAt: new Date(),
    };
    const key = generateId();

    describe('when access key does not exist', () => {
      beforeEach(() => {
        jest.spyOn(accessKeyRepo, 'findByKey').mockResolvedValue(null);
      });

      it('should call accessKeyRepo.findByKey with key', async () => {
        await service.updateAccessKey(key, reqBody).catch(() => {});

        expect(accessKeyRepo.findByKey).toHaveBeenCalledWith(key);
      });

      it('should throw NotFoundException', async () => {
        await expect(service.updateAccessKey(key, reqBody)).rejects.toThrow(NotFoundException);
      });

      it('should throw NotFoundException with message', async () => {
        await expect(service.updateAccessKey(key, reqBody)).rejects.toThrow('Access key not found');
      });
    });

    describe('when access key exists', () => {
      let response: AccessKey;

      beforeEach(async () => {
        jest.spyOn(accessKeyRepo, 'findByKey').mockResolvedValue({ key } as AccessKey);
        jest.spyOn(accessKeyRepo, 'save').mockResolvedValue({
          key,
          ...reqBody,
        } as AccessKey);

        response = await service.updateAccessKey(key, reqBody);
      });

      it('should call accessKeyRepo.save with accessKey', () => {
        expect(accessKeyRepo.save).toHaveBeenCalledWith({
          key,
          ...reqBody,
        });
      });

      it('should return accessKey', () => {
        expect(response).toEqual({
          key,
          ...reqBody,
        });
      });

      it('should call cacheService.set with key and response', () => {
        expect(cacheService.set).toHaveBeenCalledWith(key, {
          key,
          ...reqBody,
        });
      });
    });
  });

  describe('deleteAccessKey', () => {
    const key = generateId();

    describe('when access key does not exist', () => {
      beforeEach(() => {
        jest.spyOn(accessKeyRepo, 'findByKey').mockResolvedValue(null);
      });

      it('should call accessKeyRepo.findByKey with key', async () => {
        await service.deleteAccessKey(key).catch(() => {});

        expect(accessKeyRepo.findByKey).toHaveBeenCalledWith(key);
      });

      it('should throw NotFoundException', async () => {
        await expect(service.deleteAccessKey(key)).rejects.toThrow(NotFoundException);
      });

      it('should throw NotFoundException with message', async () => {
        await expect(service.deleteAccessKey(key)).rejects.toThrow('Access key not found');
      });
    });

    describe('when access key exists', () => {
      let response: { message: string };

      beforeEach(async () => {
        jest.spyOn(accessKeyRepo, 'findByKey').mockResolvedValue({ key } as AccessKey);

        response = await service.deleteAccessKey(key);
      });

      it('should call accessKeyRepo.delete with accessKey', () => {
        expect(accessKeyRepo.delete).toHaveBeenCalledWith({ key });
      });

      it('should return response', () => {
        expect(response).toEqual({
          message: 'Access key deleted successfully',
        });
      });

      it('should call cacheService.del with key', () => {
        expect(cacheService.del).toHaveBeenCalledWith(key);
      });
    });
  });

  describe('disableAccessKey', () => {
    const key = generateId();

    describe('when access key does not exist', () => {
      beforeEach(() => {
        jest.spyOn(accessKeyRepo, 'findByKey').mockResolvedValue(null);
      });

      it('should call accessKeyRepo.findByKey with key', async () => {
        await service.disableAccessKey(key).catch(() => {});

        expect(accessKeyRepo.findByKey).toHaveBeenCalledWith(key);
      });

      it('should throw NotFoundException', async () => {
        await expect(service.disableAccessKey(key)).rejects.toThrow(NotFoundException);
      });

      it('should throw NotFoundException with message', async () => {
        await expect(service.disableAccessKey(key)).rejects.toThrow('Access key not found');
      });
    });

    describe('when access key exists and is not disabled previously', () => {
      let response: AccessKey;

      beforeEach(async () => {
        jest.spyOn(accessKeyRepo, 'findByKey').mockResolvedValue({ key } as AccessKey);
        jest.spyOn(accessKeyRepo, 'save').mockResolvedValue({ key, disabled: true } as AccessKey);

        response = await service.disableAccessKey(key);
      });

      it('should call accessKeyRepo.save with accessKey', () => {
        expect(accessKeyRepo.save).toHaveBeenCalledWith({ key, disabled: true });
      });

      it('should return accessKey', () => {
        expect(response).toEqual({ key, disabled: true });
      });

      it('should call cacheService.set with key and response', () => {
        expect(cacheService.set).toHaveBeenCalledWith(key, { key, disabled: true });
      });
    });

    describe('when access key exists and is disabled previously', () => {
      let response: AccessKey;

      beforeEach(async () => {
        jest
          .spyOn(accessKeyRepo, 'findByKey')
          .mockResolvedValue({ key, disabled: true } as AccessKey);

        response = await service.disableAccessKey(key);
      });

      it('should not call accessKeyRepo.save', () => {
        expect(accessKeyRepo.save).not.toHaveBeenCalled();
      });

      it('should return accessKey', () => {
        expect(response).toEqual({ key, disabled: true });
      });
    });
  });

  describe('findAccessKeyByKey', () => {
    const key = generateId();

    describe('when access key does not exist', () => {
      beforeEach(() => {
        jest.spyOn(accessKeyRepo, 'findByKey').mockResolvedValue(null);
      });

      it('should call accessKeyRepo.findByKey with key', async () => {
        await service.findAccessKeyByKey(key).catch(() => {});

        expect(accessKeyRepo.findByKey).toHaveBeenCalledWith(key);
      });

      it('should throw NotFoundException', async () => {
        await expect(service.findAccessKeyByKey(key)).rejects.toThrow(NotFoundException);
      });

      it('should throw NotFoundException with message', async () => {
        await expect(service.findAccessKeyByKey(key)).rejects.toThrow('Access key not found');
      });
    });

    describe('when access key exists', () => {
      let response: AccessKey;

      beforeEach(async () => {
        jest.spyOn(accessKeyRepo, 'findByKey').mockResolvedValue({ key } as AccessKey);

        response = await service.findAccessKeyByKey(key);
      });

      it('should return accessKey', () => {
        expect(response).toEqual({ key });
      });
    });
  });

  describe('findCachedAccessKeyByKey', () => {
    const key = generateId();

    describe('when access key does not exist', () => {
      beforeEach(() => {
        jest.spyOn(accessKeyRepo, 'findByKey').mockResolvedValue(null);
      });

      it('should call accessKeyRepo.findByKey with key', async () => {
        await service.findCachedAccessKeyByKey(key).catch(() => {});

        expect(accessKeyRepo.findByKey).toHaveBeenCalledWith(key);
      });

      it('should throw NotFoundException', async () => {
        await expect(service.findCachedAccessKeyByKey(key)).rejects.toThrow(RpcException);
      });

      it('should throw NotFoundException with message', async () => {
        await expect(service.findCachedAccessKeyByKey(key)).rejects.toThrow('Invalid access key');
      });
    });

    describe('when access key exists', () => {
      let response: AccessKey;

      beforeEach(async () => {
        jest.spyOn(accessKeyRepo, 'findByKey').mockResolvedValue({ key } as AccessKey);
        jest.spyOn(cacheService, 'set').mockResolvedValue();

        response = await service.findCachedAccessKeyByKey(key);
      });

      it('should return accessKey', () => {
        expect(response).toEqual({ key });
      });

      it('should call cacheService.set with key and response', () => {
        expect(cacheService.set).toHaveBeenCalledWith(key, { key });
      });
    });
  });

  describe('findAccessKeys', () => {
    const query: AccessKeysGetDto = {};

    it('should call accessKeyRepo.find with query', async () => {
      await service.findAccessKeys(query);

      expect(accessKeyRepo.find).toHaveBeenCalledWith(query);
    });

    it('should return accessKeys', async () => {
      const accessKeys = [{ key: generateId() }] as AccessKey[];

      jest.spyOn(accessKeyRepo, 'find').mockResolvedValue({
        count: accessKeys.length,
        accessKeys: accessKeys,
      });

      const response = await service.findAccessKeys(query);
      expect(response.count).toBe(accessKeys.length);
      expect(response.accessKeys).toEqual(accessKeys);
    });
  });
});
