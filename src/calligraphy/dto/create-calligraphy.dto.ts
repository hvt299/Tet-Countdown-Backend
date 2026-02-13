import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCalligraphyDto {
    @ApiProperty({ example: 'Nguyễn Văn A', description: 'Tên người xin chữ' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    userName: string;

    @ApiProperty({ example: 'Năm mới bình an, công việc thuận lợi', description: 'Lời cầu nguyện' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    userWish: string;
}