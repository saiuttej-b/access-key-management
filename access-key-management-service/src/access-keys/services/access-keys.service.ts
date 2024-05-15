import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Cache } from 'cache-manager';
import { AccessKeyRepository } from 'src/domain/repositories/access-key.repository';
import { UserRepository } from 'src/domain/repositories/user.repository';
import { AccessKeyCreateDto, AccessKeyUpdateDto, AccessKeysGetDto } from '../dtos/access-keys.dto';

@Injectable()
export class AccessKeysService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly accessKeyRepo: AccessKeyRepository,
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
  ) {}

  async createAccesskey(reqBody: AccessKeyCreateDto) {
    const userExists = await this.userRepo.existsById(reqBody.userId);
    if (!userExists) {
      throw new NotFoundException('User not found to create access key');
    }

    const accessKey = this.accessKeyRepo.instance(reqBody);
    return this.accessKeyRepo.create(accessKey);
  }

  async updateAccessKey(key: string, reqBody: AccessKeyUpdateDto) {
    const accessKey = await this.accessKeyRepo.findByKey(key);
    if (!accessKey) {
      throw new NotFoundException('Access key not found');
    }

    Object.assign(accessKey, reqBody);
    const response = await this.accessKeyRepo.save(accessKey);
    await this.cacheService.set(key, response);
    return response;
  }

  async deleteAccessKey(key: string) {
    const accessKey = await this.accessKeyRepo.findByKey(key);
    if (!accessKey) {
      throw new NotFoundException('Access key not found');
    }

    await this.accessKeyRepo.delete(accessKey);
    await this.cacheService.del(key);
    return {
      message: 'Access key deleted successfully',
    };
  }

  async disableAccessKey(key: string) {
    const accessKey = await this.accessKeyRepo.findByKey(key);
    if (!accessKey) {
      throw new NotFoundException('Access key not found');
    }

    if (accessKey.disabled) return accessKey;

    accessKey.disabled = true;
    return this.accessKeyRepo.save(accessKey);
  }

  async findAccessKeyByKey(key: string) {
    const accessKey = await this.accessKeyRepo.findByKey(key);
    if (!accessKey) {
      throw new NotFoundException('Access key not found');
    }

    return accessKey;
  }

  async findCachedAccessKeyByKey(key: string) {
    try {
      const accessKey = await this.accessKeyRepo.findByKey(key);
      if (!accessKey) {
        throw new NotFoundException('Invalid access key');
      }

      await this.cacheService.set(key, accessKey);
      return accessKey;
    } catch (error: any) {
      console.error(error);
      throw new RpcException(error.response);
    }
  }

  async findAccessKeys(query: AccessKeysGetDto) {
    return this.accessKeyRepo.find(query);
  }
}
