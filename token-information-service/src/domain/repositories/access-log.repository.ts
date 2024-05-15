import { AccessLog } from '../schemas/access-log.schema';

export abstract class AccessLogRepository {
  abstract instance(data?: Partial<AccessLog>): AccessLog;

  abstract create(log: AccessLog): Promise<void>;

  abstract countSuccessRequests(props: {
    key: string;
    fromTime: Date;
    toTime: Date;
  }): Promise<number>;
}
