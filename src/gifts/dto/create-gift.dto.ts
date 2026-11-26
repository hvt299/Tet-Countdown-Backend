import { IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { GiftOrnamentType } from '../schemas/gift.schema';

export class CreateGiftDto {
  @IsMongoId({ message: 'Tree ID không hợp lệ' })
  @IsNotEmpty({ message: 'Tree ID không được để trống' })
  treeId: string;

  @IsString({ message: 'Lời chúc phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Lời chúc không được để trống' })
  @MaxLength(2000, { message: 'Lời chúc tối đa 2000 ký tự' })
  content: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  theme?: string;

  @IsOptional()
  @IsEnum(GiftOrnamentType, { message: 'Loại phụ kiện treo Tết không hợp lệ' })
  ornamentType?: GiftOrnamentType;
}

export class UpdateGiftDto {
  @IsOptional()
  @IsString({ message: 'Lời chúc phải là chuỗi ký tự' })
  @MaxLength(2000, { message: 'Lời chúc tối đa 2000 ký tự' })
  content?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  theme?: string;

  @IsOptional()
  @IsEnum(GiftOrnamentType, { message: 'Loại phụ kiện treo Tết không hợp lệ' })
  ornamentType?: GiftOrnamentType;
}
