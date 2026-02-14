import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { username, email, password } = createUserDto;

    const existingUser = await this.userModel.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      throw new BadRequestException('Username hoặc Email đã tồn tại!');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });

    return newUser.save();
  }

  async findByUsernameOrEmail(identifier: string): Promise<UserDocument | null> {
    return this.userModel.findOne({
      $or: [
        { username: identifier },
        { email: identifier }
      ]
    }).exec();
  }

  async findOne(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).select('-password').exec();
  }

  async activateUser(id: string): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(
      id,
      { isVerified: true },
      { new: true }
    ).exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByValidResetToken(hashedToken: string): Promise<UserDocument | null> {
    return this.userModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    }).exec();
  }

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId).select('-password -resetPasswordToken -resetPasswordExpires').exec();
    if (!user) throw new BadRequestException('Không tìm thấy người dùng');
    return user;
  }

  async updateProfile(userId: string, updateData: any) {
    return this.userModel.findByIdAndUpdate(userId, updateData, { new: true })
      .select('-password -resetPasswordToken -resetPasswordExpires').exec();
  }

  async changePassword(userId: string, changePasswordDto: any) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new BadRequestException('Không tìm thấy người dùng');

    const isPasswordValid = await bcrypt.compare(changePasswordDto.oldPassword, user.password);
    if (!isPasswordValid) throw new BadRequestException('Mật khẩu cũ không chính xác!');

    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return { message: 'Đổi mật khẩu thành công!' };
  }
}
