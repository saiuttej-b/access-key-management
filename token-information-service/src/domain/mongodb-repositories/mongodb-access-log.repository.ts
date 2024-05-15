import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { generateId } from 'src/utils/fn';
import { AccessLogRepository } from '../repositories/access-log.repository';
import { AccessLog } from '../schemas/access-log.schema';

@Injectable()
export class MongoDbAccessLogRepository implements AccessLogRepository {
  constructor(@InjectModel(AccessLog.name) private readonly accessLogModel: Model<AccessLog>) {}

  instance(data?: Partial<AccessLog> | undefined): AccessLog {
    const accessLog = new AccessLog();
    if (data) Object.assign(accessLog, data);
    if (!accessLog.id) accessLog.id = generateId();
    return accessLog;
  }

  async create(log: AccessLog): Promise<void> {
    await this.accessLogModel.create(log);
  }

  countSuccessRequests(props: { key: string; fromTime: Date; toTime: Date }): Promise<number> {
    return this.accessLogModel
      .countDocuments({
        $and: [
          { key: props.key },
          { timestamp: { $gte: props.fromTime } },
          { timestamp: { $lte: props.toTime } },
          { success: true },
        ],
      })
      .exec();
  }
}
