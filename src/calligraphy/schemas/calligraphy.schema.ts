import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type CalligraphyDocument = HydratedDocument<Calligraphy>;

@Schema({ timestamps: true })
export class Calligraphy {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
    user: User;
    
    @Prop({ required: true })
    userName: string;

    @Prop({ required: true })
    userWish: string;

    @Prop({ required: true })
    givenWord: string;

    @Prop()
    vietnameseMeaning: string;

    @Prop()
    poem: string;

    @Prop()
    ipAddress: string;
}

export const CalligraphySchema = SchemaFactory.createForClass(Calligraphy);