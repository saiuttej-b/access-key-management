import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AccessKey, AccessKeyRepository } from './domain/repositories/access-key.repository';
import { AccessLogRepository } from './domain/repositories/access-log.repository';
import { AccessLog } from './domain/schemas/access-log.schema';
import { setExpressRequest } from './utils/request-store';

@Injectable()
export class AccessKeyMiddleware implements NestMiddleware {
  constructor(
    private readonly accessKeyRepo: AccessKeyRepository,
    private readonly accessLogRepo: AccessLogRepository,
  ) {}

  async use(req: Request, res: Response, next: (error?: any) => void) {
    setExpressRequest(req);

    const authHeader = req.headers['x-access-key'] as string;
    if (!authHeader) {
      throw new UnauthorizedException();
    }

    const accessKey = await this.accessKeyRepo.findByKey(authHeader);
    if (!accessKey) {
      throw new UnauthorizedException('Invalid access key');
    }

    const log = this.accessLogRepo.instance({
      key: accessKey.key,
      timestamp: new Date(),
    });

    try {
      await this.checkAccessKey(accessKey, log, res);
    } finally {
      await this.accessLogRepo.create(log);
    }

    next();
  }

  async checkAccessKey(accessKey: AccessKey, log: AccessLog, res: Response) {
    if (accessKey.disabled) {
      log.success = false;
      throw new UnauthorizedException('Access key disabled');
    }
    if (accessKey.expiresAt && new Date(accessKey.expiresAt).getTime() < Date.now()) {
      log.success = false;
      throw new UnauthorizedException('Access key expired');
    }

    const time1 = new Date();
    const time2 = new Date();
    time2.setMinutes(time2.getMinutes() - 1);
    const count = await this.accessLogRepo.countSuccessRequests({
      key: accessKey.key,
      fromTime: time2,
      toTime: time1,
    });
    const limitExceeded = accessKey.rateLimit <= count;

    log.rateLimited = limitExceeded;

    res.setHeader('x-access-key', accessKey.key);
    res.setHeader('rate-limit', accessKey.rateLimit.toString());
    res.setHeader('rate-limit-remaining', Math.max(0, accessKey.rateLimit - count - 1).toString());

    if (limitExceeded) {
      log.success = false;
      throw new HttpException('Rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
    }

    log.success = true;
  }
}
