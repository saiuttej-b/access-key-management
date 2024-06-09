import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cache } from 'cache-manager';
import { FilterQuery, Model } from 'mongoose';
import { generateId } from 'src/utils/fn';
import { AccessKeyRepository } from '../repositories/access-key.repository';
import { UserRepository } from '../repositories/user.repository';
import { AccessKey, convertAccessKeyDoc } from '../schemas/access-key.schema';

@Injectable()
export class MongoDbAccessKeyRepository implements AccessKeyRepository {
  constructor(
    @InjectModel(AccessKey.name) private readonly accessKeyModel: Model<AccessKey>,
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
    private readonly userRepo: UserRepository,
  ) {}

  instance(data?: Partial<AccessKey> | undefined): AccessKey {
    const accessKey = new AccessKey();
    if (data) Object.assign(accessKey, data);
    if (!accessKey.key) accessKey.key = generateId();
    return accessKey;
  }

  async create(accessKey: AccessKey): Promise<AccessKey> {
    if (!accessKey.key) accessKey.key = generateId();

    const record = await this.accessKeyModel.create(accessKey);
    const result = convertAccessKeyDoc(record)!;
    await this.cacheService.set(result.key, result);
    return result;
  }

  async save(accessKey: AccessKey): Promise<AccessKey> {
    if (!accessKey.key) return this.create(accessKey);

    const previous = await this.accessKeyModel.findOne({ key: accessKey.key }).exec();
    if (!previous) return this.create(accessKey);

    Object.assign(previous, accessKey);
    if (!previous.isModified()) return accessKey;

    const record = await previous.save();
    const result = convertAccessKeyDoc(record)!;
    await this.cacheService.set(result.key, result);
    return result;
  }

  async delete(accessKey: AccessKey): Promise<void> {
    await this.accessKeyModel.deleteOne({ key: accessKey.key }).exec();
    await this.cacheService.del(accessKey.key);
  }

  async findByKey(key: string): Promise<AccessKey | null> {
    const cachedAccessKey = await this.cacheService.get<AccessKey>(key);
    if (cachedAccessKey) return cachedAccessKey;

    const record = await this.accessKeyModel.findOne({ key }).exec();
    return convertAccessKeyDoc(record);
  }

  async find(query?: {
    disabled?: string;
    userId?: string;
    limit?: number;
    skip?: number;
  }): Promise<{ count: number; accessKeys: AccessKey[] }> {
    if (!query) query = {};

    const filter: FilterQuery<AccessKey> = {
      ...(query.disabled ? { disabled: query.disabled === 'true' } : {}),
      ...(query.userId ? { userId: query.userId } : {}),
    };

    const [recordCount, records] = await Promise.all([
      query.limit || query.skip ? this.accessKeyModel.countDocuments(filter).exec() : 0,
      this.accessKeyModel
        .find(filter)
        .limit(query.limit || Number.MAX_SAFE_INTEGER)
        .skip(query.skip || 0)
        .exec(),
    ]);

    const count = recordCount || records.length;
    const accessKeys = convertAccessKeyDoc(records);

    const userIds = accessKeys.map((ak) => ak.userId);
    const users = await this.userRepo
      .findByIds(userIds)
      .then((r) => new Map(r.map((u) => [u.id, u])));

    accessKeys.forEach((ak) => {
      ak.user = users.get(ak.userId);
    });

    return { count, accessKeys };
  }
}
