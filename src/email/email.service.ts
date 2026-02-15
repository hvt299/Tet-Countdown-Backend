import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as brevo from '@getbrevo/brevo';

@Injectable()
export class EmailService {
  private apiInstance: brevo.TransactionalEmailsApi;

  constructor(private configService: ConfigService) {
    this.apiInstance = new brevo.TransactionalEmailsApi();
    this.apiInstance.setApiKey(
      brevo.TransactionalEmailsApiApiKeys.apiKey,
      this.configService.get<string>('BREVO_API_KEY')!
    );
  }

  async sendVerificationEmail(to: string, name: string, token: string) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const senderEmail = this.configService.get<string>('SENDER_EMAIL')!;
    const url = `${frontendUrl}/auth/verify?token=${token}`;

    const htmlContent = `
      <div style="background-color: #f4f4f4; padding: 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <div style="background-color: #d32f2f; padding: 30px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px;">
              🎆 TẾT COUNTDOWN
            </h1>
          </div>

          <div style="padding: 40px 30px; color: #333333; line-height: 1.6;">
            <p style="font-size: 16px;">Xin chào <strong>${name}</strong>,</p>
            <p>Chào mừng bạn đến với <strong>Tết Countdown</strong>! Chỉ còn một bước nữa để hoàn tất đăng ký và cùng chúng tôi đếm ngược đến khoảnh khắc giao thừa thiêng liêng.</p>
            <p>Vui lòng bấm vào nút bên dưới để xác thực tài khoản của bạn:</p>
            
            <div style="text-align: center; margin: 35px 0;">
              <a href="${url}" style="background-color: #d32f2f; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 2px 4px rgba(211, 47, 47, 0.3);">
                XÁC THỰC NGAY
              </a>
            </div>

            <p style="font-size: 14px; color: #666;">
              <em>*Link xác thực này sẽ hết hạn sau 24 giờ.</em>
            </p>
          </div>

          <div style="background-color: #fafafa; padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee;">
            <p style="margin: 0;">Bạn nhận được email này vì đã đăng ký tài khoản tại Tết Countdown.</p>
            <p style="margin: 5px 0;">Nếu không phải bạn, vui lòng bỏ qua email này.</p>
            <p style="margin-top: 10px;">Chúc Mừng Năm Mới - An Khang Thịnh Vượng 🧧</p>
          </div>

        </div>
      </div>
    `;

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = '🧧 Xác thực tài khoản Tết Countdown';
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.sender = { name: 'Tết Countdown', email: senderEmail };
    sendSmtpEmail.to = [{ email: to }];

    try {
      await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log(`📧 Email sent successfully to ${to}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Không thể gửi email xác thực');
    }
  }

  async sendResetPasswordEmail(to: string, token: string) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const senderEmail = this.configService.get<string>('SENDER_EMAIL')!;
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    const htmlContent = `
      <div style="background-color: #f4f4f4; padding: 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <div style="background-color: #d32f2f; padding: 30px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px;">
              🎆 TẾT COUNTDOWN
            </h1>
          </div>

          <div style="padding: 40px 30px; color: #333333; line-height: 1.6;">
            <h2 style="color: #d32f2f; text-align: center; margin-top: 0;">Yêu cầu đặt lại mật khẩu 🔑</h2>
            <p style="font-size: 16px;">Xin chào,</p>
            <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn tại <strong>Tết Countdown</strong>.</p>
            <p>Vui lòng bấm vào nút bên dưới để tạo mật khẩu mới:</p>
            
            <div style="text-align: center; margin: 35px 0;">
              <a href="${resetLink}" style="background-color: #d32f2f; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 2px 4px rgba(211, 47, 47, 0.3);">
                ĐẶT LẠI MẬT KHẨU
              </a>
            </div>

            <p style="font-size: 14px; color: #666;">
              <em>*Link khôi phục này sẽ hết hạn sau 15 phút.</em>
            </p>
          </div>

          <div style="background-color: #fafafa; padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee;">
            <p style="margin: 0;">Bạn nhận được email này vì có yêu cầu khôi phục mật khẩu.</p>
            <p style="margin: 5px 0;">Nếu không phải bạn yêu cầu, vui lòng bỏ qua email này.</p>
            <p style="margin-top: 10px;">Chúc Mừng Năm Mới - An Khang Thịnh Vượng 🧧</p>
          </div>

        </div>
      </div>
    `;

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = '🧧 [Tết Countdown] Đặt lại mật khẩu';
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.sender = { name: 'Tết Countdown', email: senderEmail };
    sendSmtpEmail.to = [{ email: to }];

    try {
      await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log(`📧 Reset password email sent successfully to ${to}`);
    } catch (error) {
      console.error('Error sending reset password email:', error);
      throw new Error('Không thể gửi email khôi phục');
    }
  }
}