import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LotoSessionDocument = LotoSession & Document;

@Schema({ timestamps: true })
export class LotoSession {
    @Prop({ required: true })
    sessionId: string;

    @Prop({ type: [Number], default: [] })
    drawnNumbers: number[];

    @Prop({ type: String, default: null })
    winnerId: string | null;

    @Prop({ required: true })
    jackpot: number;

    @Prop({ required: true, enum: ['FINISHED', 'ROLLOVER'] })
    status: string;
}

export const LotoSessionSchema = SchemaFactory.createForClass(LotoSession);