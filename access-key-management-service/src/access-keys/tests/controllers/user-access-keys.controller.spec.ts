import { Test, TestingModule } from '@nestjs/testing';
import { UserAccessKeysController } from 'src/access-keys/controllers/user-access-keys.controller';
import { AccessKeysService } from 'src/access-keys/services/access-keys.service';

describe('UserAccessKeysController', () => {
  let controller: UserAccessKeysController;
  let service: AccessKeysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AccessKeysService,
          useValue: {
            findAccessKeyByKey: jest.fn(),
            disableAccessKey: jest.fn(),
            findCachedAccessKeyByKey: jest.fn(),
          },
        },
      ],
      controllers: [UserAccessKeysController],
    }).compile();

    controller = module.get<UserAccessKeysController>(UserAccessKeysController);
    service = module.get<AccessKeysService>(AccessKeysService);

    jest.clearAllMocks();
  });

  describe('to be defined', () => {
    it('should be initialized', () => {
      expect(controller).toBeDefined();
      expect(service).toBeDefined();
    });
  });

  describe('findAccessKeyByKey', () => {
    const key = 'key';

    describe('should call service', () => {
      it('should call findAccessKeyByKey', async () => {
        await controller.findAccessKeyByKey(key);

        expect(service.findAccessKeyByKey).toHaveBeenCalledWith(key);
      });
    });
  });

  describe('disableAccessKey', () => {
    const key = 'key';

    describe('should call service', () => {
      it('should call disableAccessKey', async () => {
        await controller.disableAccessKey(key);

        expect(service.disableAccessKey).toHaveBeenCalledWith(key);
      });
    });
  });

  describe('getAccessKeyDetails', () => {
    const key = 'key';

    describe('should call service', () => {
      it('should call findCachedAccessKeyByKey', async () => {
        await controller.getAccessKeyDetails({ key });

        expect(service.findCachedAccessKeyByKey).toHaveBeenCalledWith(key);
      });
    });
  });
});
