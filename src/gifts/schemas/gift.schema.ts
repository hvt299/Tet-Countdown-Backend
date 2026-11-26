import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type GiftDocument = HydratedDocument<Gift>;

export enum GiftOrnamentType {
  LIXI = 'lixi',
  THOI_VANG = 'thoi_vang',
  CAU_DOI = 'cau_doi',
  DEN_LONG = 'den_long',
  PHAO_HOA = 'phao_hoa',
  DONG_TIEN = 'dong_tien',
  MAI_FLOWER = 'mai_flower',
  DAO_FLOWER = 'dao_flower',
}

@Schema({ timestamps: true, collection: 'tet_gifts' })
export class Gift {
  @Prop({
    type: Types.ObjectId,
    ref: 'Tree',
    required: true,
  })
  treeId: Types.ObjectId;

  @Prop({
    required: true,
    trim: true,
    maxlength: 2000,
  })
  content: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  senderId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  receiverId: Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  isOpened: boolean;

  @Prop({
    type: String,
    default: 'red_lixi',
    trim: true,
    maxlength: 50,
  })
  theme: string;

  @Prop({
    type: String,
    enum: GiftOrnamentType,
    default: GiftOrnamentType.LIXI,
    required: true,
  })
  ornamentType: GiftOrnamentType;

  @Prop({ type: Date, default: null })
  openedAt: Date | null;
}

export const GiftSchema = SchemaFactory.createForClass(Gift);

GiftSchema.index({ treeId: 1, senderId: 1 }, { unique: true });
GiftSchema.index({ treeId: 1, createdAt: -1 });
GiftSchema.index({ senderId: 1, createdAt: -1 });
GiftSchema.index({ receiverId: 1, createdAt: -1 });
