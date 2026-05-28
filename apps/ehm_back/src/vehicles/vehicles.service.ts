import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { Vehicle } from '../models/vehicle.model';
import { Brand } from '../models/brands.model';


@Injectable()
export class VehiclesService {
  private readonly db = admin.firestore();

  async findAll(brandId?: string, userId?: string): Promise<Vehicle[]> {
    const queryRef = brandId
      ? this.db.collection('vehicles').where('brandId', '==', brandId)
      : this.db.collection('vehicles');

    const snapshot = await queryRef.get();
    const vehicles = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Vehicle));
    return this.withFavoriteState(vehicles, userId);
  }

  async findOne(id: string, userId?: string): Promise<Vehicle> {
    const doc = await this.db.collection('vehicles').doc(id).get();

    if (!doc.exists) {
      throw new NotFoundException(`Vehicle with id ${id} not found`);
    }

    const [vehicle] = await this.withFavoriteState(
      [{ id: doc.id, ...doc.data() } as Vehicle],
      userId,
    );
    return vehicle;
  }

  async create(createVehicleDto: CreateVehicleDto): Promise<{ id: string }> {
    const data = {
      ...createVehicleDto,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    const docRef = await this.db.collection('vehicles').add(data);
    return { id: docRef.id };
  }

  async update(id: string, updateVehicleDto: UpdateVehicleDto): Promise<void> {
    const docRef = this.db.collection('vehicles').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new NotFoundException(`Vehicle with id ${id} not found`);
    }

    await docRef.update({
      ...updateVehicleDto,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  async remove(id: string): Promise<void> {
    const docRef = this.db.collection('vehicles').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new NotFoundException(`Vehicle with id ${id} not found`);
    }

    await docRef.delete();
  }

  async setFavorite(
    vehicleId: string,
    userId: string | undefined,
    favorite: boolean,
  ): Promise<{ vehicleId: string; isFavorite: boolean }> {
    if (!userId) {
      throw new BadRequestException('User id is required');
    }

    const vehicleDoc = await this.db.collection('vehicles').doc(vehicleId).get();
    if (!vehicleDoc.exists) {
      throw new NotFoundException(`Vehicle with id ${vehicleId} not found`);
    }

    const favoriteRef = this.db.collection('favorites').doc(`${userId}_${vehicleId}`);

    if (favorite) {
      await favoriteRef.set(
        {
          userId,
          vehicleId,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          syncedToWarehouse: false,
        },
        { merge: true },
      );
    } else {
      await favoriteRef.delete();
    }

    return { vehicleId, isFavorite: favorite };
  }

  async findBrands(): Promise<Brand[]> {
    const brandsSnapshot = await this.db.collection('brands').get();

    return brandsSnapshot.docs.map((brandDoc) => {
      const brandData = brandDoc.data() as Brand;

      return {
        ...brandData,
        id: typeof brandData.id === 'string' ? brandData.id : brandDoc.id,
      };
    });
  }

  private async withFavoriteState(vehicles: Vehicle[], userId?: string): Promise<Vehicle[]> {
    const favoriteVehicleIds = await this.getFavoriteVehicleIds(userId);
    return vehicles.map((vehicle) => ({
      ...vehicle,
      isFavorite: vehicle.id ? favoriteVehicleIds.has(vehicle.id) : false,
    }));
  }

  private async getFavoriteVehicleIds(userId?: string): Promise<Set<string>> {
    if (!userId) {
      return new Set();
    }

    const snapshot = await this.db
      .collection('favorites')
      .where('userId', '==', userId)
      .get();

    return new Set(
      snapshot.docs
        .map((doc) => doc.data().vehicleId)
        .filter((vehicleId): vehicleId is string => typeof vehicleId === 'string'),
    );
  }
}
