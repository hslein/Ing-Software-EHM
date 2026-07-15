import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configurar el transportador con variables de entorno
    // Para desarrollo, puedes usar un servicio como Mailtrap o Gmail
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true para 465, false para otros puertos
      auth: process.env.SMTP_USER
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          }
        : undefined,
    });
  }

  /**
   * Envía un email de confirmación de cita de forma asincrónica
   * No bloquea la respuesta principal
   */
  async sendAppointmentConfirmation(
    userEmail: string,
    appointmentData: {
      marca: string;
      modelo: string;
      fecha: Date;
      hora: string;
      motivo: string;
    }
  ): Promise<void> {
    try {
      const htmlTemplate = this.generateAppointmentTemplate(appointmentData);

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@concesionario.com',
        to: userEmail,
        subject: 'Confirmación de tu cita en el concesionario',
        html: htmlTemplate,
      };

      // Enviar de forma asincrónica sin esperar
      this.transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          this.logger.error(
            `Error enviando email a ${userEmail}: ${error.message}`,
            error.stack
          );
        } else {
          this.logger.log(
            `Email de confirmación enviado a ${userEmail}: ${info.response}`
          );
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Error al preparar email de confirmación: ${errorMessage}`,
        errorStack
      );
    }
  }

  /**
   * Genera la plantilla HTML para el email de confirmación
   */
  private generateAppointmentTemplate(data: {
    marca: string;
    modelo: string;
    fecha: Date;
    hora: string;
    motivo: string;
  }): string {
    const fechaFormato = new Date(data.fecha).toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; }
            .content { background-color: #fff; padding: 30px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .header { border-bottom: 3px solid #0066cc; padding-bottom: 15px; margin-bottom: 20px; }
            .header h1 { margin: 0; color: #0066cc; }
            .appointment-details { background-color: #f9f9f9; padding: 15px; border-left: 4px solid #0066cc; margin: 20px 0; }
            .appointment-details p { margin: 10px 0; }
            .label { font-weight: bold; color: #0066cc; }
            .footer { text-align: center; font-size: 12px; color: #999; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 15px; }
            .button { display: inline-block; background-color: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              <div class="header">
                <h1>✓ Cita Confirmada</h1>
              </div>

              <p>Hola,</p>
              <p>Tu cita en nuestro concesionario ha sido registrada exitosamente. Los detalles son:</p>

              <div class="appointment-details">
                <p><span class="label">Vehículo:</span> ${data.marca} ${data.modelo}</p>
                <p><span class="label">Fecha:</span> ${fechaFormato}</p>
                <p><span class="label">Hora:</span> ${data.hora}</p>
                <p><span class="label">Motivo:</span> ${data.motivo}</p>
              </div>

              <p>Por favor, llega 10 minutos antes de la hora programada. Si necesitas reprogramar o tienes preguntas, no dudes en contactarnos.</p>

              <p><strong>¡Esperamos verte pronto!</strong></p>

              <div class="footer">
                <p>Este es un mensaje automático. Por favor, no respondas a este correo.</p>
                <p>&copy; 2026 Concesionario EHM. Todos los derechos reservados.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
