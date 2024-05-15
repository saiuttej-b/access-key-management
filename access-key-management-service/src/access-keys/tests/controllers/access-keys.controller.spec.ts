import { Test, TestingModule } from '@nestjs/testing';
import { validate } from 'class-validator';
import { AccessKeysController } from 'src/access-keys/controllers/access-keys.controller';
import {
  AccessKeyCreateDto,
  AccessKeyUpdateDto,
  AccessKeysGetDto,
} from 'src/access-keys/dtos/access-keys.dto';
import { AccessKeysService } from 'src/access-keys/services/access-keys.service';
import { generateId } from 'src/utils/fn';

describe('AccessKeysController', () => {
  let controller: AccessKeysController;
  let service: AccessKeysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AccessKeysService,
          useValue: {
            createAccesskey: jest.fn(),
            updateAccessKey: jest.fn(),
            deleteAccessKey: jest.fn(),
            findAccessKeyByKey: jest.fn(),
            findAccessKeys: jest.fn(),
          },
        },
      ],
      controllers: [AccessKeysController],
    }).compile();

    controller = module.get<AccessKeysController>(AccessKeysController);
    service = module.get<AccessKeysService>(AccessKeysService);

    jest.clearAllMocks();
  });

  describe('to be defined', () => {
    it('controller should be defined', () => {
      expect(controller).toBeDefined();
      expect(service).toBeDefined();
    });
  });

  describe('createAccesskey', () => {
    const reqBody: AccessKeyCreateDto = {
      userId: generateId(),
      disabled: false,
      rateLimit: 100,
      expiresAt: new Date(),
    };

    describe('should call service', () => {
      it('should call createAccesskey', async () => {
        await controller.createAccesskey(reqBody);
        expect(service.createAccesskey).toHaveBeenCalledWith(reqBody);
      });
    });

    describe('validations', () => {
      describe('userId', () => {
        describe('when userId is not provided', () => {
          it('should throw an error', async () => {
            const body = new AccessKeyCreateDto();
            Object.assign(body, { ...reqBody, userId: '' });

            const errors = await validate(body);

            expect(errors).toHaveLength(1);

            const error = errors.find((e) => e.property === 'userId');
            expect(error?.constraints).toMatchObject({
              isNotEmpty: expect.any(String),
            });
          });
        });
      });

      describe('disabled', () => {
        describe('when disabled is not provided', () => {
          it('should throw an error', async () => {
            const body = new AccessKeyCreateDto();
            Object.assign(body, { ...reqBody, disabled: null });

            const errors = await validate(body);

            expect(errors).toHaveLength(1);

            const error = errors.find((e) => e.property === 'disabled');
            expect(error?.constraints).toMatchObject({
              isBoolean: expect.any(String),
            });
          });
        });
      });

      describe('rateLimit', () => {
        describe('when rateLimit is not provided', () => {
          it('should throw an error', async () => {
            const body = new AccessKeyCreateDto();
            Object.assign(body, { ...reqBody, rateLimit: null });

            const errors = await validate(body);

            expect(errors).toHaveLength(1);

            const error = errors.find((e) => e.property === 'rateLimit');
            expect(error?.constraints).toMatchObject({
              isNumber: expect.any(String),
            });
          });

          describe('when rateLimit is less than 0', () => {
            it('should throw an error', async () => {
              const body = new AccessKeyCreateDto();
              Object.assign(body, { ...reqBody, rateLimit: -1 });

              const errors = await validate(body);

              expect(errors).toHaveLength(1);

              const error = errors.find((e) => e.property === 'rateLimit');
              expect(error?.constraints).toMatchObject({
                min: expect.any(String),
              });
            });
          });
        });
      });

      describe('expiresAt', () => {
        describe('when expiresAt is not provided', () => {
          it('should not throw an error', async () => {
            const body = new AccessKeyCreateDto();
            Object.assign(body, { ...reqBody, expiresAt: null });

            const errors = await validate(body);

            expect(errors).toHaveLength(0);
          });
        });

        describe('when invalid date is provided', () => {
          it('should throw an error', async () => {
            const body = new AccessKeyCreateDto();
            Object.assign(body, { ...reqBody, expiresAt: 'invalid date' });

            const errors = await validate(body);

            expect(errors).toHaveLength(1);

            const error = errors.find((e) => e.property === 'expiresAt');
            expect(error?.constraints).toMatchObject({
              isDate: expect.any(String),
            });
          });
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

    describe('should call service', () => {
      it('should call updateAccessKey', async () => {
        await controller.updateAccessKey(reqBody, key);
        expect(service.updateAccessKey).toHaveBeenCalledWith(key, reqBody);
      });
    });

    describe('validations', () => {
      describe('disabled', () => {
        describe('when disabled is not provided', () => {
          it('should throw an error', async () => {
            const body = new AccessKeyUpdateDto();
            Object.assign(body, { ...reqBody, disabled: null });

            const errors = await validate(body);

            expect(errors).toHaveLength(1);

            const error = errors.find((e) => e.property === 'disabled');
            expect(error?.constraints).toMatchObject({
              isBoolean: expect.any(String),
            });
          });
        });
      });

      describe('rateLimit', () => {
        describe('when rateLimit is not provided', () => {
          it('should throw an error', async () => {
            const body = new AccessKeyUpdateDto();
            Object.assign(body, { ...reqBody, rateLimit: null });

            const errors = await validate(body);

            expect(errors).toHaveLength(1);

            const error = errors.find((e) => e.property === 'rateLimit');
            expect(error?.constraints).toMatchObject({
              isNumber: expect.any(String),
            });
          });

          describe('when rateLimit is less than 0', () => {
            it('should throw an error', async () => {
              const body = new AccessKeyUpdateDto();
              Object.assign(body, { ...reqBody, rateLimit: -1 });

              const errors = await validate(body);

              expect(errors).toHaveLength(1);

              const error = errors.find((e) => e.property === 'rateLimit');
              expect(error?.constraints).toMatchObject({
                min: expect.any(String),
              });
            });
          });
        });
      });

      describe('expiresAt', () => {
        describe('when expiresAt is not provided', () => {
          it('should not throw an error', async () => {
            const body = new AccessKeyUpdateDto();
            Object.assign(body, { ...reqBody, expiresAt: null });

            const errors = await validate(body);

            expect(errors).toHaveLength(0);
          });
        });

        describe('when invalid date is provided', () => {
          it('should throw an error', async () => {
            const body = new AccessKeyUpdateDto();
            Object.assign(body, { ...reqBody, expiresAt: 'invalid date' });

            const errors = await validate(body);

            expect(errors).toHaveLength(1);

            const error = errors.find((e) => e.property === 'expiresAt');
            expect(error?.constraints).toMatchObject({
              isDate: expect.any(String),
            });
          });
        });
      });
    });
  });

  describe('deleteAccessKey', () => {
    const key = generateId();

    describe('should call service', () => {
      it('should call deleteAccessKey', async () => {
        await controller.deleteAccessKey(key);
        expect(service.deleteAccessKey).toHaveBeenCalledWith(key);
      });
    });
  });

  describe('findAccessKeyByKey', () => {
    const key = generateId();

    describe('should call service', () => {
      it('should call findAccessKeyByKey', async () => {
        await controller.findAccessKeyByKey(key);
        expect(service.findAccessKeyByKey).toHaveBeenCalledWith(key);
      });
    });
  });

  describe('findAccessKeys', () => {
    const query: AccessKeysGetDto = {
      userId: generateId(),
      disabled: 'false',
      limit: 10,
      skip: 0,
    };

    describe('should call service', () => {
      it('should call findAccessKeys', async () => {
        await controller.findAccessKeys(query);
        expect(service.findAccessKeys).toHaveBeenCalledWith(query);
      });
    });

    describe('validations', () => {
      describe('limit', () => {
        describe('when limit is not provided', () => {
          it('should not throw an error', async () => {
            const body = new AccessKeysGetDto();
            Object.assign(body, { ...query, limit: null });

            const errors = await validate(body);

            expect(errors).toHaveLength(0);
          });

          describe('when limit is less than 1', () => {
            it('should throw an error', async () => {
              const body = new AccessKeysGetDto();
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
            const body = new AccessKeysGetDto();
            Object.assign(body, { ...query, skip: null });

            const errors = await validate(body);

            expect(errors).toHaveLength(0);
          });

          describe('when skip is less than 0', () => {
            it('should throw an error', async () => {
              const body = new AccessKeysGetDto();
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
