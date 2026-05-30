import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { CreateCreditSimulationEventDto } from './dto/create-credit-simulation-event.dto';
import { CreateVehicleComparisonEventDto } from './dto/create-vehicle-comparison-event.dto';
import { CreateVehicleViewEventDto } from './dto/create-vehicle-view-event.dto';

@Injectable()
export class InteractionEventsService {
  private readonly db = admin.firestore();

  async createVehicleView(
    userId: string | undefined,
    dto: CreateVehicleViewEventDto,
  ): Promise<{ id: string }> {
    if (!userId) {
      throw new BadRequestException('User id is required');
    }

    const vehicle = await this.getVehicle(dto.vehicleId);
    const ref = await this.db.collection('vehicle_views').add({
      userId,
      vehicleId: dto.vehicleId,
      brandId: this.stringValue(vehicle.brandId),
      viewedAt: admin.firestore.FieldValue.serverTimestamp(),
      syncedToWarehouse: false,
    });

    return { id: ref.id };
  }

  async createVehicleComparison(
    userId: string | undefined,
    dto: CreateVehicleComparisonEventDto,
  ): Promise<{ id: string }> {
    if (!userId) {
      throw new BadRequestException('User id is required');
    }

    if (dto.firstVehicleId === dto.secondVehicleId) {
      throw new BadRequestException('Comparison requires two different vehicles');
    }

    await Promise.all([this.getVehicle(dto.firstVehicleId), this.getVehicle(dto.secondVehicleId)]);

    const ref = await this.db.collection('vehicle_comparisons').add({
      userId,
      firstVehicleId: dto.firstVehicleId,
      secondVehicleId: dto.secondVehicleId,
      comparedAt: admin.firestore.FieldValue.serverTimestamp(),
      syncedToWarehouse: false,
    });

    return { id: ref.id };
  }

  async createCreditSimulation(
    userId: string | undefined,
    dto: CreateCreditSimulationEventDto,
  ): Promise<{ id: string }> {
    if (!userId) {
      throw new BadRequestException('User id is required');
    }

    await this.getVehicle(dto.vehicleId);

    const ref = await this.db.collection('credit_simulations').add({
      userId,
      vehicleId: dto.vehicleId,
      vehiclePrice: this.numberValue(dto.vehiclePrice),
      downPayment: this.numberValue(dto.downPayment),
      amountFinanced: this.numberValue(dto.amountFinanced),
      termMonths: this.numberValue(dto.termMonths),
      interestRate: this.numberValue(dto.interestRate),
      estimatedMonthlyPayment: this.numberValue(dto.estimatedMonthlyPayment),
      simulatedAt: admin.firestore.FieldValue.serverTimestamp(),
      syncedToWarehouse: false,
    });

    return { id: ref.id };
  }

  private async getVehicle(vehicleId: string) {
    if (!vehicleId) {
      throw new BadRequestException('Vehicle id is required');
    }

    const doc = await this.db.collection('vehicles').doc(vehicleId).get();

    if (!doc.exists) {
      throw new NotFoundException(`Vehicle with id ${vehicleId} not found`);
    }

    return doc.data() ?? {};
  }

  private stringValue(value: unknown): string | null {
    return typeof value === 'string' && value.length > 0 ? value : null;
  }

  private numberValue(value: unknown): number | null {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return null;
    }

    return value;
  }
}
