import { IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateTreeDto {
  @IsInt({ message: 'Năm cây phải là số nguyên' })
  @Min(2000, { message: 'Năm không hợp lệ' })
  @Max(9999, { message: 'Năm không hợp lệ' })
  year: number;

  @IsString({ message: 'Tên cây phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên cây không được để trống' })
  @MaxLength(100, { message: 'Tên cây tối đa 100 ký tự' })
  name: string;

  @IsOptional()
  @IsString({ message: 'Chủ đề cây phải là chuỗi ký tự' })
  @MaxLength(50, { message: 'Chủ đề tối đa 50 ký tự' })
  theme?: string;
}
