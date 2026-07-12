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

  async findFavorites(userId: string | undefined): Promise<Vehicle[]> {
    if (!userId) {
      throw new BadRequestException('User id is required');
    }

    const favoritesSnapshot = await this.db
      .collection('favorites')
      .where('userId', '==', userId)
      .get();

    const vehicleIds = favoritesSnapshot.docs
      .map((doc) => doc.data().vehicleId)
      .filter((vehicleId): vehicleId is string => typeof vehicleId === 'string');

    const vehicles = await Promise.all(
      vehicleIds.map(async (vehicleId) => {
        const vehicleDoc = await this.db.collection('vehicles').doc(vehicleId).get();
        return vehicleDoc.exists ? ({ id: vehicleDoc.id, ...vehicleDoc.data() } as Vehicle) : null;
      }),
    );

    return vehicles
      .filter((vehicle): vehicle is Vehicle => Boolean(vehicle))
      .map((vehicle) => ({ ...vehicle, isFavorite: true }));
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

  async findPopularBrands(limit = 10): Promise<Brand[]> {
    const brands = await this.findBrands();
    const vehiclesSnapshot = await this.db.collection('vehicles').get();
    const vehicles = vehiclesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Vehicle),
    }));
    const vehicleBrandIds = new Map(
      vehicles
        .filter((vehicle) => typeof vehicle.id === 'string' && typeof vehicle.brandId === 'string')
        .map((vehicle) => [vehicle.id as string, vehicle.brandId]),
    );
    const scores = new Map<string, number>();

    brands.forEach((brand) => {
      if (brand.id) {
        scores.set(brand.id, 0);
      }
    });

    vehicles.forEach((vehicle) => {
      if (vehicle.brandId) {
        scores.set(vehicle.brandId, (scores.get(vehicle.brandId) ?? 0) + 1);
      }
    });

    await this.addInteractionScores(scores, vehicleBrandIds, 'vehicle_views', 1);
    await this.addInteractionScores(scores, vehicleBrandIds, 'favorites', 4);
    await this.addInteractionScores(scores, vehicleBrandIds, 'credit_simulations', 5);

    return [...brands]
      .sort((first, second) => {
        const firstScore = first.id ? scores.get(first.id) ?? 0 : 0;
        const secondScore = second.id ? scores.get(second.id) ?? 0 : 0;
        return secondScore - firstScore || first.name.localeCompare(second.name);
      })
      .slice(0, limit);
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

  private async addInteractionScores(
    scores: Map<string, number>,
    vehicleBrandIds: Map<string, string>,
    collectionName: string,
    weight: number,
  ): Promise<void> {
    const snapshot = await this.db.collection(collectionName).get();

    snapshot.docs.forEach((doc) => {
      const vehicleId = doc.data().vehicleId;
      if (typeof vehicleId !== 'string') {
        return;
      }

      const brandId = vehicleBrandIds.get(vehicleId);
      if (!brandId) {
        return;
      }

      scores.set(brandId, (scores.get(brandId) ?? 0) + weight);
    });
  }
}
