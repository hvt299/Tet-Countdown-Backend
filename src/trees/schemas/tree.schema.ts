import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TreeDocument = HydratedDocument<Tree>;

export enum TreeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Schema({
  timestamps: true,
  collection: 'tet_trees',
})
export class Tree {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  ownerId: Types.ObjectId;

  @Prop({
    required: true,
    min: 2000,
    max: 9999,
  })
  year: number;

  @Prop({
    required: true,
    trim: true,
    maxlength: 100,
  })
  name: string;

  @Prop({
    type: String,
    default: 'mai',
    trim: true,
    maxlength: 50,
  })
  theme: string; // 'mai' | 'dao' | 'quat'

  @Prop({
    type: String,
    enum: TreeStatus,
    default: TreeStatus.ACTIVE,
    required: true,
  })
  status: TreeStatus;
}

export const TreeSchema = SchemaFactory.createForClass(Tree);

TreeSchema.index({ ownerId: 1, year: 1 }, { unique: true });
TreeSchema.index({ ownerId: 1, year: -1 });
