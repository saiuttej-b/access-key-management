import { Injectable, NotFoundException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { AccessKeyRepository } from 'src/domain/repositories/access-key.repository';
import { UserRepository } from 'src/domain/repositories/user.repository';
import {
  AccessKeyCreateDto,
  AccessKeyUpdateDto,
  AccessKeysGetDto,
  ChangeAccessKeyStatusDto,
} from '../dtos/access-keys.dto';

@Injectable()
export class AccessKeysService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly accessKeyRepo: AccessKeyRepository,
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
    return this.accessKeyRepo.save(accessKey);
  }

  async deleteAccessKey(key: string) {
    const accessKey = await this.accessKeyRepo.findByKey(key);
    if (!accessKey) {
      throw new NotFoundException('Access key not found');
    }

    await this.accessKeyRepo.delete(accessKey);
    return {
      message: 'Access key deleted successfully',
    };
  }

  async changeAccessKeyStatus(body: ChangeAccessKeyStatusDto) {
    const accessKey = await this.accessKeyRepo.findByKey(body.key);
    if (!accessKey) {
      throw new NotFoundException('Invalid access key');
    }

    if (accessKey.disabled === body.disabled) return accessKey;

    accessKey.disabled = body.disabled;
    return this.accessKeyRepo.save(accessKey);
  }

  async findAccessKeyByKey(key: string) {
    const accessKey = await this.accessKeyRepo.findByKey(key);
    if (!accessKey) {
      throw new NotFoundException('Invalid access key');
    }

    const user = await this.userRepo.findById(accessKey.userId);
    if (user) accessKey.user = user;

    return accessKey;
  }

  async findCachedAccessKeyByKey(key: string) {
    try {
      return await this.findAccessKeyByKey(key);
    } catch (error: any) {
      throw new RpcException(error.response);
    }
  }

  async findAccessKeys(query: AccessKeysGetDto) {
    return this.accessKeyRepo.find(query);
  }
}
