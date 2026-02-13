import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findByUsername(username);

        if (user && (await bcrypt.compare(pass, user.password))) {

            if (!user.isActive) {
                throw new UnauthorizedException('Tài khoản đã bị khóa.');
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
            fullName: user.fullName
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
}