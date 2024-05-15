export type AccessKey = {
  key: string;
  userId: string;
  rateLimit: number;
  expiresAt?: Date;
  disabled: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export abstract class AccessKeyRepository {
  abstract findByKey(key: string): Promise<AccessKey | null>;
}
