import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

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
    it('should return token info', () => {
      const accessKey = 'access-key';
      const req = {
        headers: {
          'x-access-key': accessKey,
        },
      };
      expect(appController.getTokenInfo(req as any)).toEqual({
        message: 'Token info',
        accessKey,
      });
    });
  });
});
