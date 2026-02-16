import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BauCuaBetDocument = HydratedDocument<BauCuaBet>;

@Schema({ timestamps: true })
export class BauCuaBet {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ required: true })
    sessionId: string;

    @Prop({ type: Object, required: true })
    bets: Record<string, number>;

    @Prop({ type: [String], required: true })
    result: string[];

    @Prop({ required: true })
    netProfit: number;
}

export const BauCuaBetSchema = SchemaFactory.createForClass(BauCuaBet);