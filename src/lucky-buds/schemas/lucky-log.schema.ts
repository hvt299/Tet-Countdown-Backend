import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LuckyLogDocument = LuckyLog & Document;

@Schema({ timestamps: true })
export class LuckyLog {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Wish', required: true })
    wishId: Types.ObjectId;

    @Prop({ required: true })
    coinsReceived: number;

    @Prop({ default: Date.now })
    pickedAt: Date;
}

export const LuckyLogSchema = SchemaFactory.createForClass(LuckyLog);