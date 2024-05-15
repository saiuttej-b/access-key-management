import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export const AccessLogCName = 'access_logs';

@Schema({ collection: AccessLogCName })
export class AccessLog {
  @Prop({ required: true, immutable: true })
  id: string;

  @Prop({ required: true })
  key: string;

  @Prop({ required: true })
  timestamp: Date;

  @Prop({ default: true })
  success: boolean;

  @Prop({ default: false })
  rateLimited: boolean;
}
export const AccessLogSchema = SchemaFactory.createForClass(AccessLog);
AccessLogSchema.index({ id: -1 }, { unique: true });
AccessLogSchema.index({ key: 1, timestamp: -1, rateLimit: 1 });
