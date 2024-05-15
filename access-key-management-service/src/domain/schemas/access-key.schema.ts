import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { convertDoc } from 'src/utils/mongoose-fn';
import { User } from './user.schema';

export const AccessKeyCName = 'access_keys';

@Schema({ collection: AccessKeyCName, timestamps: true, versionKey: false, id: false })
export class AccessKey {
  @Prop({ required: true, immutable: true })
  key: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ default: 0 })
  rateLimit: number;

  @Prop({ default: null })
  expiresAt?: Date;

  @Prop({ default: false })
  disabled: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  user?: User;
}

export const AccessKeySchema = SchemaFactory.createForClass(AccessKey);
AccessKeySchema.index({ key: 1 }, { unique: true });

export const convertAccessKeyDoc = convertDoc(AccessKey);
