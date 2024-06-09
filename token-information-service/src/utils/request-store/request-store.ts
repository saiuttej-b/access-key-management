import { NextFunction, Request, Response } from 'express';
import { AccessKey } from 'src/domain/repositories/access-key.repository';
import { get, set, store } from './request-store-config';

export const EXPRESS_REQUEST = 'EXPRESS_REQUEST';
export const ACCESS_KEY_DETAILS = 'ACCESS_KEY_DETAILS';

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

export function setAccessKeyDetails(details: AccessKey) {
  set(ACCESS_KEY_DETAILS, details);
}

export function getAccessKeyDetails() {
  return get<AccessKey>(ACCESS_KEY_DETAILS);
}
