import { User } from '../schemas/user.schema';

export abstract class UserRepository {
  abstract instance(data?: Partial<User>): User;

  abstract create(user: User): Promise<User>;

  abstract existsById(id: string): Promise<boolean>;

  abstract existsByEmail(email: string): Promise<boolean>;

  abstract findByEmailWithPassword(email: string): Promise<User | null>;

  abstract findById(id: string): Promise<User | null>;

  abstract findByIds(ids: string[]): Promise<User[]>;
}
