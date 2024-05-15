import { Controller, Get, Param, Post } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AccessKeysService } from '../services/access-keys.service';

@Controller('user-access-keys')
export class UserAccessKeysController {
  constructor(private readonly service: AccessKeysService) {}

  @Get(':key')
  findAccessKeyByKey(@Param('key') key: string) {
    return this.service.findAccessKeyByKey(key);
  }

  @Post(':key/disable')
  disableAccessKey(@Param('key') key: string) {
    return this.service.disableAccessKey(key);
  }

  @MessagePattern('getAccessKeyDetails')
  getAccessKeyDetails({ key }: { key: string }) {
    return this.service.findCachedAccessKeyByKey(key);
  }
}
