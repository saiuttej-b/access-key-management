import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('token-info')
  getTokenInfo(@Req() req: Request) {
    const accessKey = req.headers['x-access-key'] as string;
    return {
      message: 'Token info',
      accessKey,
    };
  }
}
