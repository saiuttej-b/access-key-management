import { Module, Provider } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoDbAccessKeyRepository } from './mongodb-repositories/mongodb-access-key.repository';
import { MongoDbUserRepository } from './mongodb-repositories/mongodb-user.repository';
import { AccessKeyRepository } from './repositories/access-key.repository';
import { UserRepository } from './repositories/user.repository';
import { AccessKey, AccessKeySchema } from './schemas/access-key.schema';
import { User, UserSchema } from './schemas/user.schema';

const repos: Provider[] = [
  {
    provide: UserRepository,
    useClass: MongoDbUserRepository,
  },
  {
    provide: AccessKeyRepository,
    useClass: MongoDbAccessKeyRepository,
  },
];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: AccessKey.name, schema: AccessKeySchema },
    ]),
  ],
  providers: [...repos],
  exports: [...repos],
})
export class DomainModule {}
