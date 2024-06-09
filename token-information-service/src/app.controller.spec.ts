import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccessKey } from './domain/repositories/access-key.repository';
import * as store from './utils/request-store';

jest.mock('./utils/request-store', () => ({
  ...jest.requireActual('./utils/request-store'),
  getAccessKeyDetails: jest.fn().mockReturnValue({}),
}));

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('getTokenInfo', () => {
    jest.spyOn(store, 'getAccessKeyDetails').mockReturnValue({ key: 'key' } as AccessKey);
    it('should return token info', () => {
      expect(appController.getTokenInfo()).toEqual({
        message: 'Token info',
        accessKey: expect.any(Object),
      });
    });
  });
});
