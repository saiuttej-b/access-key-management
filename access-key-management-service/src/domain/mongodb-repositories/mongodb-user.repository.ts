import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { generateId } from 'src/utils/fn';
import { UserRepository } from '../repositories/user.repository';
import { User, convertUserDoc } from '../schemas/user.schema';

@Injectable()
export class MongoDbUserRepository implements UserRepository {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

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
    const record = await this.userModel.findOne({ id }).exec();
    return convertUserDoc(record);
  }

  async findByIds(ids: string[]): Promise<User[]> {
    if (!ids.length) return [];

    const records = await this.userModel.find({ id: { $in: ids } }).exec();
    return convertUserDoc(records);
  }
}
