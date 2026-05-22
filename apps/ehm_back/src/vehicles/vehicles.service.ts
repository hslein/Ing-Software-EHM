import { Injectable, NotFoundException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

export interface Vehicle {
  id?: string;
  model: string;
  type: 'suv' | 'sedan' | 'deportivo' | 'pickup';
  image: string;
  description: string;
  brand: string;
  price?: number;
  year?: number;
  mileage?: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Brand {
  id?: string;
  name: string;
  image: string;
  vehicles?: Vehicle[];
}

@Injectable()
export class VehiclesService {
  private readonly db = admin.firestore();

  async findAll(brand?: string): Promise<Vehicle[]> {
    const queryRef = brand
      ? this.db.collection('vehicles').where('brand', '==', brand)
      : this.db.collection('vehicles');

    const snapshot = await queryRef.get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Vehicle));
  }

  async findOne(id: string): Promise<Vehicle> {
    const doc = await this.db.collection('vehicles').doc(id).get();

    if (!doc.exists) {
      throw new NotFoundException(`Vehicle with id ${id} not found`);
    }

    return { id: doc.id, ...doc.data() } as Vehicle;
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

  async findBrands(): Promise<Brand[]> {
    const brandsSnapshot = await this.db.collection('brands').get();

    const brandsList = await Promise.all(
      brandsSnapshot.docs.map(async (brandDoc) => {
        const brandData = brandDoc.data() as Omit<Brand, 'id' | 'vehicles'>;
        const vehiclesSnapshot = await this.db
          .collection('vehicles')
          .where('brand', '==', brandData.name)
          .get();

        const vehicles = vehiclesSnapshot.docs.map((vehicleDoc) => ({
          id: vehicleDoc.id,
          ...vehicleDoc.data(),
        })) as Vehicle[];

        return {
          id: brandDoc.id,
          ...brandData,
          vehicles,
        } as Brand;
      }),
    );

    return brandsList;
  }
}
