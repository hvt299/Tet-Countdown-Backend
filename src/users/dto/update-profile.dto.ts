import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    fullName?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    avatar?: string;
}