import { ConfigService } from '@nestjs/config';
import { Document, HydratedDocument } from 'mongoose';
import { EnvType } from './env';

export const mongoConfig = (configService: ConfigService<EnvType>) => {
  const username = encodeURIComponent(configService.get('MONGO_DB_USERNAME') || '');
  const password = encodeURIComponent(configService.get('MONGO_DB_PASSWORD') || '');
  const DB_NAME = configService.get('MONGO_DB_DATABASE') || '';
  const DB_HOST = configService.get('MONGO_DB_HOST') || '';
  const AUTH = `${username}:${password}`;
  const DB = `${DB_HOST}/${DB_NAME}`;
  const MONGO_URI = `mongodb+srv://${AUTH}@${DB}?retryWrites=true&w=majority`;

  const autoIndex = configService.get('MONGO_DB_AUTO_INDEX') !== 'false';

  return {
    MONGO_URI,
    MONGO_AUTO_INDEX: autoIndex,
  };
};

export function convertDoc<T extends object>(classType: { new (): T }) {
  function convertDocFn(value: Array<HydratedDocument<T> | object>): T[];
  function convertDocFn(value: HydratedDocument<T> | object | null): T | null;
  function convertDocFn(
    value: HydratedDocument<T> | object | Array<HydratedDocument<T> | object> | null,
  ): T | T[] | null {
    if (!value) return null;
    if (Array.isArray(value)) return value.map((v) => convertSingleDocFn(v));

    return convertSingleDocFn(value);
  }

  function convertSingleDocFn(value: HydratedDocument<T> | object): T {
    const res = new classType();

    if (value instanceof Document) {
      Object.assign(res, value.toJSON());
      return res;
    }

    delete value['__v'];
    delete value['_id'];
    Object.assign(res, value);
    return res;
  }

  return convertDocFn;
}
