import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WishDocument = Wish & Document;

@Schema({ timestamps: true, collection: 'tet_lucky_wishes' })
export class Wish {
    @Prop({ required: true })
    content: string;

    @Prop({ default: 'general' })
    type: string;
}

export const WishSchema = SchemaFactory.createForClass(Wish);