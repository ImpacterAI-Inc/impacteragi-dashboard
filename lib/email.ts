import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const ses = new SESClient({ region: 'us-east-1' });
const FROM_EMAIL = 'alexander@homefreedom.com';

export const email = {
  async sendWelcomeEmail(to: string, loginUrl: string): Promise<void> {
    const params = {
      Source: FROM_EMAIL,
      Destination: {
        ToAddresses: [to]
      },
      Message: {
        Subject: {
          Data: 'Welcome to ImpacterAGI - Your Account is Ready!'
        },
        Body: {
          Html: {
            Data: `
              <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <h1 style="color: #4F46E5;">Welcome to ImpacterAGI! 🚀</h1>
                  <p>Your account has been created and your credits are ready to use.</p>
                  <p><strong>Login to your dashboard:</strong></p>
                  <a href="${loginUrl}" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0;">Access Dashboard</a>
                  <p style="margin-top: 20px;">If the button doesn't work, copy this link:</p>
                  <p style="background: #f3f4f6; padding: 10px; border-radius: 4px; word-break: break-all;">${loginUrl}</p>
                  <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                  <p style="color: #6b7280; font-size: 14px;">If you didn't sign up for ImpacterAGI, please ignore this email.</p>
                </body>
              </html>
            `
          },
          Text: {
            Data: `Welcome to ImpacterAGI!\n\nYour account has been created and your credits are ready to use.\n\nLogin here: ${loginUrl}\n\nIf you didn't sign up for ImpacterAGI, please ignore this email.`
          }
        }
      }
    };

    await ses.send(new SendEmailCommand(params));
  },

  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
    const params = {
      Source: FROM_EMAIL,
      Destination: {
        ToAddresses: [to]
      },
      Message: {
        Subject: {
          Data: 'Reset Your ImpacterAGI Password'
        },
        Body: {
          Html: {
            Data: `
              <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <h1 style="color: #4F46E5;">Reset Your Password</h1>
                  <p>Click the button below to reset your password:</p>
                  <a href="${resetUrl}" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0;">Reset Password</a>
                  <p style="margin-top: 20px;">This link will expire in 1 hour.</p>
                  <p style="background: #f3f4f6; padding: 10px; border-radius: 4px; word-break: break-all;">${resetUrl}</p>
                  <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                  <p style="color: #6b7280; font-size: 14px;">If you didn't request a password reset, please ignore this email.</p>
                </body>
              </html>
            `
          },
          Text: {
            Data: `Reset your password: ${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.`
          }
        }
      }
    };

    await ses.send(new SendEmailCommand(params));
  }
};
