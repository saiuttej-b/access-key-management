import { UnauthorizedException } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { User } from 'src/domain/schemas/user.schema';
import { get, set, store } from './request-store-config';

export const EXPRESS_REQUEST = 'EXPRESS_REQUEST';
export const CURRENT_USER = 'CURRENT_USER';

export const storeMiddleWare = (req: Request, _res: Response, next: NextFunction) => {
  store.run(new Map(), () => {
    setExpressRequest(req);
    return next();
  });
};

export const storeSession = async <T>(session: () => Promise<T> | T) => {
  return new Promise<T>((resolve, reject) => {
    store.run(new Map(), async () => {
      try {
        const res = await session();
        resolve(res);
      } catch (error) {
        reject(error);
      }
    });
  });
};

export function setExpressRequest(req: Request) {
  set(EXPRESS_REQUEST, req);
}

export function getExpressRequest() {
  return get<Request>(EXPRESS_REQUEST);
}

export function setUser(data: User) {
  set(CURRENT_USER, data);
}

export function getUserOrNot() {
  return get<User>(CURRENT_USER);
}

export function getUser() {
  const user = getUserOrNot();
  if (!user) {
    throw new UnauthorizedException('Unable to get current user details');
  }
  return user;
}
