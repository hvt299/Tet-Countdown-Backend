import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateTreeDto {
  @IsOptional()
  @IsString({ message: 'Tên cây phải là chuỗi ký tự' })
  @MaxLength(100, { message: 'Tên cây tối đa 100 ký tự' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Chủ đề cây phải là chuỗi ký tự' })
  @MaxLength(50, { message: 'Chủ đề tối đa 50 ký tự' })
  theme?: string;
}
