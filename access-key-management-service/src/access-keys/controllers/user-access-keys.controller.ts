import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ChangeAccessKeyStatusDto } from '../dtos/access-keys.dto';
import { AccessKeysService } from '../services/access-keys.service';

@Controller('user-access-keys')
export class UserAccessKeysController {
  constructor(private readonly service: AccessKeysService) {}

  @MessagePattern('changeAccessKeyStatus')
  changeAccessKeyStatus(@Payload() body: ChangeAccessKeyStatusDto) {
    return this.service.changeAccessKeyStatus(body);
  }

  @MessagePattern('getAccessKeyDetails')
  getAccessKeyDetails({ key }: { key: string }) {
    return this.service.findCachedAccessKeyByKey(key);
  }
}
