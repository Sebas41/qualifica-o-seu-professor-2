import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get('SMTP_PORT', 587),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendVerificationEmail(email: string, verificationLink: string): Promise<void> {
    const appName = this.configService.get('APP_NAME', 'Qualifica o Seu Professor');
    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3001');

    const mailOptions = {
      from: `"${appName}" <${this.configService.get('SMTP_USER')}>`,
      to: email,
      subject: `Verifica tu cuenta en ${appName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f9f9f9;
              border-radius: 10px;
              padding: 30px;
              border: 1px solid #e0e0e0;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #2563eb;
              margin: 0;
            }
            .button {
              display: inline-block;
              padding: 15px 30px;
              background-color: #2563eb;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              font-weight: bold;
              margin: 20px 0;
            }
            .button:hover {
              background-color: #1d4ed8;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e0e0e0;
              font-size: 12px;
              color: #666;
              text-align: center;
            }
            .warning {
              background-color: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${appName}</h1>
            </div>
            
            <p>Hola,</p>
            
            <p>Gracias por registrarte en ${appName}. Para completar tu registro, necesitamos verificar tu dirección de correo electrónico.</p>
            
            <p>Haz clic en el botón de abajo para verificar tu cuenta:</p>
            
            <div style="text-align: center;">
              <a href="${verificationLink}" class="button">Verificar mi Cuenta</a>
            </div>
            
            <p>O copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 5px; font-family: monospace;">
              ${verificationLink}
            </p>
            
            <div class="warning">
              <strong>⚠️ Importante:</strong> Este enlace expirará en 15 minutos y solo puede ser usado una vez.
            </div>
            
            <p>Una vez verificada tu cuenta, podrás iniciar sesión con tu email y contraseña.</p>
            
            <p>Si no creaste esta cuenta, puedes ignorar este mensaje de forma segura.</p>
            
            <div class="footer">
              <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
              <p>&copy; ${new Date().getFullYear()} ${appName}. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Hola,

        Gracias por registrarte en ${appName}. Para completar tu registro, necesitamos verificar tu dirección de correo electrónico.

        Haz clic en este enlace para verificar tu cuenta:
        ${verificationLink}

        Este enlace expirará en 15 minutos y solo puede ser usado una vez.

        Una vez verificada tu cuenta, podrás iniciar sesión con tu email y contraseña.

        Si no creaste esta cuenta, puedes ignorar este mensaje de forma segura.

        Saludos,
        El equipo de ${appName}
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const appName = this.configService.get('APP_NAME', 'Qualifica o Seu Professor');

    const mailOptions = {
      from: `"${appName}" <${this.configService.get('SMTP_USER')}>`,
      to: email,
      subject: `¡Bienvenido a ${appName}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f9f9f9;
              border-radius: 10px;
              padding: 30px;
              border: 1px solid #e0e0e0;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #2563eb;
              margin: 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>¡Bienvenido, ${name}!</h1>
            </div>
            
            <p>Tu cuenta en ${appName} ha sido creada exitosamente.</p>
            
            <p>Ahora puedes iniciar sesión usando tu email. Te enviaremos un enlace mágico cada vez que quieras acceder.</p>
            
            <p>¡Gracias por unirte!</p>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending welcome email:', error);
      // No lanzar error aquí, el email de bienvenida es opcional
    }
  }
}

