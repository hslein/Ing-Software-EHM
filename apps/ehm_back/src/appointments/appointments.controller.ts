import { Body, Controller, Get, Post, Delete, Param, Req, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../firebase/firebase-auth.guard';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@Controller('api/appointments')
@UseGuards(FirebaseAuthGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  /**
   * POST /api/appointments
   * Registra una nueva cita y envía email de confirmación de forma asincrónica
   */
  @Post()
  async bookAppointment(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @Req() req: any
  ) {
    const userId = req.user?.uid;
    const userEmail = req.user?.email;

    if (!userId) {
      throw new Error('Usuario no autenticado');
    }

    return this.appointmentsService.bookAppointment(
      userId,
      userEmail,
      createAppointmentDto
    );
  }

  /**
   * GET /api/appointments
   * Obtiene todas las citas del usuario autenticado
   */
  @Get()
  async getUserAppointments(@Req() req: any) {
    const userId = req.user?.uid;

    if (!userId) {
      throw new Error('Usuario no autenticado');
    }

    return this.appointmentsService.getUserAppointments(userId);
  }

  /**
   * DELETE /api/appointments/:id
   * Cancela una cita específica del usuario
   */
  @Delete(':id')
  async cancelAppointment(
    @Param('id') appointmentId: string,
    @Req() req: any
  ) {
    const userId = req.user?.uid;

    if (!userId) {
      throw new Error('Usuario no autenticado');
    }

    await this.appointmentsService.cancelAppointment(appointmentId, userId);
    return { message: 'Cita cancelada exitosamente' };
  }
}
