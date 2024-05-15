import { BadRequestException } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';

export const store = new AsyncLocalStorage();

export const getStore = () => {
  const data = store.getStore();
  if (!data) {
    throw new BadRequestException('Request store is not initialized');
  }
  return data as Map<string, any>;
};

export const set = (key: string, value: any) => getStore().set(key, value);

export function get<T>(key: string): T | undefined {
  const data = store.getStore() as Map<string, any>;
  if (!data) return;
  return data.get(key);
}
