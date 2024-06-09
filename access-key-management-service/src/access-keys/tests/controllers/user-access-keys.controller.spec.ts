import { Test, TestingModule } from '@nestjs/testing';
import { UserAccessKeysController } from 'src/access-keys/controllers/user-access-keys.controller';
import { ChangeAccessKeyStatusDto } from 'src/access-keys/dtos/access-keys.dto';
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
            changeAccessKeyStatus: jest.fn(),
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

  describe('changeAccessKeyStatus', () => {
    const body: ChangeAccessKeyStatusDto = {
      key: 'key',
      disabled: true,
    };

    describe('should call service', () => {
      it('should call changeAccessKeyStatus', async () => {
        await controller.changeAccessKeyStatus(body);

        expect(service.changeAccessKeyStatus).toHaveBeenCalledWith(body);
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
