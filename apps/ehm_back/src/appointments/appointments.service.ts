import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);
  private adminDb = admin.firestore();

  constructor(private readonly emailService: EmailService) {}

  /**
   * Registra una nueva cita de agendamiento y envía email de confirmación
   * El envío de email es asincrónico y no bloquea la respuesta
   */
  async bookAppointment(
    userId: string,
    userEmail: string,
    createAppointmentDto: CreateAppointmentDto
  ): Promise<{ appointmentId: string; message: string }> {
    try {
      // Validar que el usuario tenga email
      if (!userEmail) {
        throw new BadRequestException('Email del usuario es requerido');
      }

      const { slotId, marca, modelo, motivo } = createAppointmentDto;

      // Registrar la cita en Firestore usando transacción
      const appointmentId = await this.recordAppointmentInFirebase(
        userId,
        userEmail,
        { slotId, marca, modelo, motivo }
      );

      // Enviar email de confirmación de forma asincrónica (sin esperar)
      // Esto no bloquea la respuesta al cliente
      this.sendConfirmationEmailAsync(userEmail, {
        marca,
        modelo,
        motivo,
        appointmentId,
      });

      return {
        appointmentId,
        message: 'Cita registrada exitosamente. Un email de confirmación será enviado en breve.',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error al registrar cita: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  /**
   * Registra la cita en Firestore de forma segura usando transacción
   */
  private async recordAppointmentInFirebase(
    userId: string,
    userEmail: string,
    appointmentData: {
      slotId: string;
      marca: string;
      modelo: string;
      motivo: string;
    }
  ): Promise<string> {
    try {
      const appointmentId = this.adminDb.collection('appointments').doc().id;

      const slotRef = this.adminDb.collection('bookedSlots').doc(appointmentData.slotId);
      const appointmentRef = this.adminDb.collection('appointments').doc(appointmentId);

      await this.adminDb.runTransaction(async (transaction) => {
        const slotDoc = await transaction.get(slotRef);

        if (slotDoc.exists) {
          throw new BadRequestException('El horario seleccionado ya está ocupado');
        }

        // Parsear el slotId para obtener la fecha y hora
        const { date, time } = this.parseSlotId(appointmentData.slotId);

        // Registrar el slot como ocupado
        transaction.set(slotRef, {
          userId,
          appointmentId,
          bookedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Registrar la cita con todos los detalles
        transaction.set(appointmentRef, {
          userId,
          userEmail,
          slotId: appointmentData.slotId,
          marca: appointmentData.marca.trim(),
          modelo: appointmentData.modelo.trim(),
          motivo: appointmentData.motivo.trim(),
          scheduledAt: date,
          hora: time,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          status: 'confirmed',
        });
      });

      return appointmentId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error en transacción de Firestore: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  /**
   * Envía el email de confirmación de forma asincrónica sin bloquear
   */
  private async sendConfirmationEmailAsync(
    userEmail: string,
    appointmentData: {
      marca: string;
      modelo: string;
      motivo: string;
      appointmentId: string;
    }
  ): Promise<void> {
    // Ejecutar el envío de email en background sin esperar
    setImmediate(async () => {
      try {
        // Aquí obtenemos los detalles completos de la cita para el email
        const appointmentDoc = await this.adminDb
          .collection('appointments')
          .doc(appointmentData.appointmentId)
          .get();

        if (appointmentDoc.exists) {
          const data = appointmentDoc.data();
          if (data) {
            await this.emailService.sendAppointmentConfirmation(userEmail, {
              marca: appointmentData.marca,
              modelo: appointmentData.modelo,
              fecha: data.scheduledAt?.toDate() || new Date(),
              hora: data.hora || 'Próximamente',
              motivo: appointmentData.motivo,
            });
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        this.logger.error(
          `Error al enviar email asincrónico a ${userEmail}: ${errorMessage}`,
          errorStack
        );
        // No relanzar el error ya que es asincrónico
      }
    });
  }

  /**
   * Parsea el slotId para extraer fecha y hora
   * Formato esperado: YYYYMMDD-HHmm (ej: 20260601-1430)
   */
  private parseSlotId(slotId: string): { date: Date; time: string } {
    try {
      const [dateStr, timeStr] = slotId.split('-');

      if (!dateStr || !timeStr || dateStr.length !== 8 || timeStr.length !== 4) {
        throw new Error('Formato de slotId inválido');
      }

      const year = parseInt(dateStr.substring(0, 4));
      const month = parseInt(dateStr.substring(4, 6)) - 1; // JavaScript months are 0-indexed
      const day = parseInt(dateStr.substring(6, 8));

      const hour = parseInt(timeStr.substring(0, 2));
      const minute = parseInt(timeStr.substring(2, 4));

      const date = new Date(year, month, day, hour, minute);

      return {
        date,
        time: `${timeStr.substring(0, 2)}:${timeStr.substring(2, 4)}`,
      };
    } catch (error) {
      this.logger.warn(`Error parseando slotId: ${slotId}. Usando fecha actual.`);
      return {
        date: new Date(),
        time: '00:00',
      };
    }
  }

  /**
   * Obtiene todas las citas de un usuario
   */
  async getUserAppointments(userId: string): Promise<any[]> {
    try {
      const snapshot = await this.adminDb
        .collection('appointments')
        .where('userId', '==', userId)
        .orderBy('scheduledAt', 'desc')
        .get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error al obtener citas del usuario: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  /**
   * Cancela una cita
   */
  async cancelAppointment(appointmentId: string, userId: string): Promise<void> {
    try {
      const appointmentRef = this.adminDb.collection('appointments').doc(appointmentId);
      const appointmentDoc = await appointmentRef.get();

      if (!appointmentDoc.exists) {
        throw new BadRequestException('Cita no encontrada');
      }

      const appointment = appointmentDoc.data();

      if (!appointment) {
        throw new BadRequestException('Cita no tiene datos válidos');
      }

      // Verificar que la cita pertenece al usuario
      if (appointment.userId !== userId) {
        throw new BadRequestException('No tienes permiso para cancelar esta cita');
      }

      // Actualizar estado y liberar el slot
      await this.adminDb.runTransaction(async (transaction) => {
        const slotRef = this.adminDb.collection('bookedSlots').doc(appointment.slotId);

        transaction.delete(slotRef);
        transaction.update(appointmentRef, {
          status: 'cancelled',
          cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      this.logger.log(`Cita ${appointmentId} cancelada por usuario ${userId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error al cancelar cita: ${errorMessage}`, errorStack);
      throw error;
    }
  }
}
