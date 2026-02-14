import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'Token không được để trống' })
    @IsString()
    token: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
    @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
        message: 'Mật khẩu quá yếu: Phải chứa ít nhất 1 chữ thường, 1 chữ hoa, 1 số và 1 ký tự đặc biệt',
    })
    newPassword: string;
}