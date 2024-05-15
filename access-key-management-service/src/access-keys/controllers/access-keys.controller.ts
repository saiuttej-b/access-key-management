import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/user-auth.guard';
import { AccessKeyCreateDto, AccessKeyUpdateDto, AccessKeysGetDto } from '../dtos/access-keys.dto';
import { AccessKeysService } from '../services/access-keys.service';

@JwtAuthGuard()
@Controller('access-keys')
export class AccessKeysController {
  constructor(private readonly service: AccessKeysService) {}

  @Post()
  createAccesskey(@Body() reqBody: AccessKeyCreateDto) {
    return this.service.createAccesskey(reqBody);
  }

  @Put(':key')
  updateAccessKey(@Body() reqBody: AccessKeyUpdateDto, @Param('key') key: string) {
    return this.service.updateAccessKey(key, reqBody);
  }

  @Delete(':key')
  deleteAccessKey(@Param('key') key: string) {
    return this.service.deleteAccessKey(key);
  }

  @Get(':key')
  findAccessKeyByKey(@Param('key') key: string) {
    return this.service.findAccessKeyByKey(key);
  }

  @Get()
  findAccessKeys(@Query() query: AccessKeysGetDto) {
    return this.service.findAccessKeys(query);
  }
}
