import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { setExpressRequest, setUser } from 'src/utils/request-store';
import { AuthService } from '../services/auth.service';

@Injectable()
export class UserAuthMiddleware implements NestMiddleware {
  constructor(private readonly service: AuthService) {}

  async use(req: Request, _: Response, next: (error?: any) => void) {
    setExpressRequest(req);

    let route = req.originalUrl.split('?')[0];
    if (route.startsWith('/api')) route = route.slice(4);
    if (route.startsWith('/auth')) return next();

    const authHeader = req.headers.authorization;
    if (!authHeader) return next();

    const accessToken = authHeader.split(' ')[1];
    if (accessToken) {
      const user = await this.service.getUserFromAccessToken(accessToken);
      if (user) setUser(user);
    }

    next();
  }
}
