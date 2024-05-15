import { AccessKey } from '../schemas/access-key.schema';

export abstract class AccessKeyRepository {
  abstract instance(data?: Partial<AccessKey>): AccessKey;

  abstract create(accessKey: AccessKey): Promise<AccessKey>;

  abstract save(accessKey: AccessKey): Promise<AccessKey>;

  abstract delete(accessKey: AccessKey): Promise<void>;

  abstract findByKey(key: string): Promise<AccessKey | null>;

  abstract find(query?: {
    disabled?: string;
    userId?: string;
    limit?: number;
    skip?: number;
  }): Promise<{ count: number; accessKeys: AccessKey[] }>;
}
