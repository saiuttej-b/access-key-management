import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cache } from 'cache-manager';
import { FilterQuery, Model } from 'mongoose';
import { generateId } from 'src/utils/fn';
import { UserRepository } from '../repositories/user.repository';
import { User, convertUserDoc } from '../schemas/user.schema';

@Injectable()
export class MongoDbUserRepository implements UserRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
  ) {}

  instance(data?: Partial<User> | undefined): User {
    const user = new User();
    if (data) Object.assign(user, data);
    if (!user.id) user.id = generateId();
    return user;
  }

  async create(user: User): Promise<User> {
    if (!user.id) user.id = generateId();

    const record = await this.userModel.create(user);
    return convertUserDoc(record)!;
  }

  async existsById(id: string): Promise<boolean> {
    const count = await this.userModel.countDocuments({ id }).exec();
    return count > 0;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.userModel.countDocuments({ email: email.toLowerCase() }).exec();
    return count > 0;
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    const record = await this.userModel
      .findOne({ email: email.toLowerCase() })
      .select('+password')
      .exec();
    return convertUserDoc(record);
  }

  async findById(id: string): Promise<User | null> {
    const cachedUser = await this.cacheService.get<User>(id);
    if (cachedUser) return cachedUser;

    const record = await this.userModel.findOne({ id }).exec();
    const result = convertUserDoc(record);

    if (result) await this.cacheService.set(id, result);

    return result;
  }

  async findByIds(ids: string[]): Promise<User[]> {
    if (!ids.length) return [];

    const records = await this.userModel.find({ id: { $in: ids } }).exec();
    return convertUserDoc(records);
  }

  async find(query?: {
    search?: string;
    limit?: number;
    skip?: number;
  }): Promise<{ count: number; users: User[] }> {
    query = query || {};

    const filter: FilterQuery<User> = {
      ...(query.search && {
        $text: {
          $search: query.search,
        },
      }),
    };

    const [recordsCount, records] = await Promise.all([
      query.limit || query.skip ? this.userModel.countDocuments(filter).exec() : 0,
      this.userModel
        .find(filter)
        .sort({ fullName: -1 })
        .skip(query.skip || 0)
        .limit(query.limit || 0)
        .exec(),
    ]);

    const count = recordsCount || records.length;
    const users = convertUserDoc(records);

    return { count, users };
  }
}
