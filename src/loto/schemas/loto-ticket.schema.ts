import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LotoTicketDocument = LotoTicket & Document;

@Schema({ timestamps: true })
export class LotoTicket {
    @Prop({ required: true })
    sessionId: string;

    @Prop({ required: true })
    userId: string;

    @Prop({ type: [[Number]], required: true })
    matrix: number[][];

    @Prop({ required: true })
    price: number;
}

export const LotoTicketSchema = SchemaFactory.createForClass(LotoTicket);