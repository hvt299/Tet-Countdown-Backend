import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BauCuaLogDocument = HydratedDocument<BauCuaLog>;

@Schema({ timestamps: true })
export class BauCuaLog {
    @Prop({ required: true, unique: true })
    sessionId: string;

    @Prop({ type: [String], required: true })
    result: string[];

    @Prop({ default: 0 })
    totalBet: number;

    @Prop({ default: 0 })
    totalPayout: number;
}

export const BauCuaLogSchema = SchemaFactory.createForClass(BauCuaLog);