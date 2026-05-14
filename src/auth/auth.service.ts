import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { EmailService } from '../email/email.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AuthService {
    private googleClient: OAuth2Client;

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private emailService: EmailService,
        private configService: ConfigService
    ) {
        this.googleClient = new OAuth2Client(
            this.configService.get<string>('GOOGLE_CLIENT_ID')
        );
    }

    async register(createUserDto: CreateUserDto) {
        const newUser = await this.usersService.create(createUserDto);

        const token = this.jwtService.sign(
            { sub: (newUser as any)._id },
            { expiresIn: '1d' }
        );

        await this.emailService.sendVerificationEmail(
            newUser.email,
            newUser.fullName,
            token
        );

        return {
            message: 'Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản.',
        };
    }

    async verifyEmail(token: string) {
        try {
            const payload = this.jwtService.verify(token);

            await this.usersService.activateUser(payload.sub);

            return { message: 'Xác thực thành công! Tài khoản đã được kích hoạt.' };
        } catch (error) {
            throw new BadRequestException('Link xác thực không hợp lệ hoặc đã hết hạn.');
        }
    }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findByUsernameOrEmail(username);

        if (user && (await bcrypt.compare(pass, user.password))) {

            if (!user.isActive) {
                throw new UnauthorizedException('Tài khoản đã bị khóa bởi Admin.');
            }

            if (!user.isVerified) {
                throw new UnauthorizedException('Vui lòng kiểm tra email để kích hoạt tài khoản trước khi đăng nhập!');
            }

            const { password, ...result } = user.toObject();
            return result;
        }

        return null;
    }

    async login(user: any) {
        const payload = {
            username: user.username,
            sub: user._id,
            role: user.role,
            fullName: user.fullName,
            avatar: user.avatar
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                _id: user._id,
                username: user.username,
                fullName: user.fullName,
                role: user.role,
                avatar: user.avatar
            }
        };
    }

    async forgotPassword(email: string) {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            return { message: 'Nếu email tồn tại, link khôi phục đã được gửi.' };
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();

        await this.emailService.sendResetPasswordEmail(user.email, resetToken);

        return { message: 'Nếu email tồn tại, link khôi phục đã được gửi.' };
    }

    async resetPassword(token: string, newPassword: string) {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await this.usersService.findByValidResetToken(hashedToken);

        if (!user) {
            throw new BadRequestException('Link không hợp lệ hoặc đã hết hạn!');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return { message: 'Mật khẩu đã được đặt lại thành công! Bạn có thể đăng nhập.' };
    }

    async googleLogin(token: string) {
        try {
            const { data } = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!data || !data.email) {
                throw new BadRequestException('Token Google không hợp lệ!');
            }

            const { email, name, picture, sub } = data;

            let user = await this.usersService.findByEmail(email);

            if (!user) {
                const randomPassword = crypto.randomBytes(16).toString('hex') + 'A1@';
                const username = `google_${sub.substring(0, 8)}`;

                const newUser = await this.usersService.create({
                    username: username,
                    email: email,
                    password: randomPassword,
                    fullName: name || 'Người dùng Google',
                    avatar: picture
                });

                user = await this.usersService.activateUser((newUser as any)._id);
            }

            if (!user) throw new BadRequestException('Không thể khởi tạo tài khoản.');
            if (!user.isActive) throw new UnauthorizedException('Tài khoản đã bị khóa.');

            return this.login(user);

        } catch (error) {
            console.error('Google Auth Error:', error);
            throw new UnauthorizedException('Xác thực Google thất bại!');
        }
    }
}