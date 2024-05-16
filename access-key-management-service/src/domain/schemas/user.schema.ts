import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { convertDoc } from 'src/utils/mongoose-fn';

export const UserCName = 'users';

@Schema({ collection: UserCName, timestamps: true, versionKey: false })
export class User {
  @Prop({ required: true, immutable: true })
  id: string;

  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ required: true, trim: true, lowercase: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ default: false })
  isAdmin: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ id: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ fullName: 'text', email: 'text' });

export const convertUserDoc = convertDoc(User);
