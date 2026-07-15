import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { CreateUserVehicleDto } from './dto/create-user-vehicle.dto';
import { UserVehicle } from '../models/user-vehicle.model';

@Injectable()
export class UserVehiclesService {
  private readonly db = admin.firestore();
  private readonly collection = 'user_vehicles';

  async findAllByUser(userId: string | undefined): Promise<UserVehicle[]> {
    if (!userId) {
      throw new BadRequestException('User id is required');
    }

    const snapshot = await this.db
      .collection(this.collection)
      .where('userId', '==', userId)
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as UserVehicle));
  }

  async create(userId: string | undefined, dto: CreateUserVehicleDto): Promise<UserVehicle> {
    if (!userId) {
      throw new BadRequestException('User id is required');
    }

    const payload = {
      userId,
      brand: dto.brand.trim(),
      model: dto.model.trim(),
      year: dto.year,
      mileage: dto.mileage,
      purchaseDate: dto.purchaseDate,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await this.db.collection(this.collection).add(payload);
    const created = await docRef.get();

    return { id: created.id, ...(created.data() as Omit<UserVehicle, 'id'>) };
  }

  async remove(userId: string | undefined, id: string): Promise<void> {
    if (!userId) {
      throw new BadRequestException('User id is required');
    }

    const docRef = this.db.collection(this.collection).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new NotFoundException(`User vehicle with id ${id} not found`);
    }

    const data = doc.data() as UserVehicle;
    if (data.userId !== userId) {
      throw new NotFoundException(`User vehicle with id ${id} not found`);
    }

    await docRef.delete();
  }
}
