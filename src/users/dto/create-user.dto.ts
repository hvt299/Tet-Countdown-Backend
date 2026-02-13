import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../schemas/user.schema';

export class CreateUserDto {
    @ApiProperty({ example: 'nguyenvana', description: 'Tên đăng nhập (duy nhất)' })
    @IsString()
    @IsNotEmpty({ message: 'Username không được để trống' })
    @MinLength(4, { message: 'Username phải có ít nhất 4 ký tự' })
    @MaxLength(20)
    username: string;

    @ApiProperty({ example: 'user@example.com', description: 'Email chính chủ' })
    @IsEmail({}, { message: 'Email không đúng định dạng' })
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'MatKhauManh123', description: 'Mật khẩu mạnh (Min 8, 1 Hoa, 1 Thường, 1 Số)' })
    @IsString()
    @MinLength(8, { message: 'Mật khẩu phải có tối thiểu 8 ký tự' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
        message: 'Mật khẩu quá yếu: Phải chứa ít nhất 1 chữ thường, 1 chữ hoa và 1 số',
    })
    password: string;

    @ApiProperty({ example: 'Nguyễn Văn A', description: 'Họ và tên hiển thị' })
    @IsString()
    @IsNotEmpty()
    fullName: string;

    @ApiProperty({ example: 'https://example.com/avatar.jpg', required: false })
    @IsOptional()
    @IsString()
    avatar?: string;

    @ApiProperty({ enum: UserRole, default: UserRole.USER, description: 'Vai trò: user hoặc admin', required: false })
    @IsOptional()
    @IsEnum(UserRole, { message: 'Role phải là user hoặc admin' })
    role?: UserRole;

    @ApiProperty({ example: true, description: 'Trạng thái hoạt động', required: false })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}