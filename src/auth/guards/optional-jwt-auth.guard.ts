import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = any>(
    err: any,
    user: TUser | false | null,
    info: any,
  ): TUser | null {
    if (err) {
      throw err;
    }

    if (user) {
      return user;
    }

    // Không có token hoặc token không gửi: tiếp tục với tư cách khách (guest)
    if (info?.name === 'JsonWebTokenError' || info?.name === 'TokenExpiredError') {
      // Token hết hạn hoặc sai: bỏ qua để tiếp tục xem công khai như khách
      return null;
    }

    return null;
  }
}
