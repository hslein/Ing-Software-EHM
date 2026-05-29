import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { WarehouseDbService } from './warehouse-db.service';

type FirestoreDate = Date | string | { toDate?: () => Date } | undefined;
type EtlStage =
  | 'users'
  | 'brands'
  | 'vehicles'
  | 'vehicleViews'
  | 'favorites'
  | 'comparisons'
  | 'creditSimulations';

export interface EtlProcessedCounts {
  users: number;
  brands: number;
  vehicles: number;
  vehicleViews: number;
  favorites: number;
  comparisons: number;
  creditSimulations: number;
}

export interface EtlRunResult {
  success: boolean;
  processed: EtlProcessedCounts;
  limit: number;
  startedAt: string;
  finishedAt: string;
}

export interface EtlStageResult {
  success: boolean;
  stage: EtlStage;
  processed: number;
  limit: number;
  nextCursor: string | null;
  startedAt: string;
  finishedAt: string;
}

interface EtlBatchResult {
  processed: number;
  nextCursor: string | null;
}

interface VehicleDoc {
  brandId?: string;
  model?: string;
  type?: string;
  year?: unknown;
  price?: unknown;
  mileage?: unknown;
  fuelType?: string;
  transmission?: string;
  seats?: unknown;
  engine?: string;
}

@Injectable()
export class WarehouseEtlService {
  private static readonly DEFAULT_BATCH_LIMIT = 100;
  private readonly db = admin.firestore();
  private lastRun: EtlRunResult | null = null;
  private lastError: string | null = null;

  constructor(private readonly warehouseDb: WarehouseDbService) {}

  async run(limit = WarehouseEtlService.DEFAULT_BATCH_LIMIT): Promise<EtlRunResult> {
    const batchLimit = this.normalizeLimit(limit);
    const startedAt = new Date();
    const processed: EtlProcessedCounts = {
      users: 0,
      brands: 0,
      vehicles: 0,
      vehicleViews: 0,
      favorites: 0,
      comparisons: 0,
      creditSimulations: 0,
    };

    try {
      processed.users = (await this.loadUsers(batchLimit)).processed;
      processed.brands = (await this.loadBrands(batchLimit)).processed;
      processed.vehicles = (await this.loadVehicles(batchLimit)).processed;
      processed.vehicleViews = (await this.loadVehicleViews(batchLimit)).processed;
      processed.favorites = (await this.loadFavorites(batchLimit)).processed;
      processed.comparisons = (await this.loadComparisons(batchLimit)).processed;
      processed.creditSimulations = (await this.loadCreditSimulations(batchLimit)).processed;

      const result = {
        success: true,
        processed,
        limit: batchLimit,
        startedAt: startedAt.toISOString(),
        finishedAt: new Date().toISOString(),
      };
      this.lastRun = result;
      this.lastError = null;
      return result;
    } catch (error) {
      this.lastError = error instanceof Error ? error.message : 'Unknown ETL error';
      throw error;
    }
  }

  async runStage(stage: EtlStage, limit = WarehouseEtlService.DEFAULT_BATCH_LIMIT, after?: string) {
    const batchLimit = this.normalizeLimit(limit);
    const startedAt = new Date();

    try {
      const batch = await this.runStageLoader(stage, batchLimit, after);
      const result = {
        success: true,
        stage,
        processed: batch.processed,
        limit: batchLimit,
        nextCursor: batch.nextCursor,
        startedAt: startedAt.toISOString(),
        finishedAt: new Date().toISOString(),
      };
      this.lastRun = {
        success: true,
        processed: this.processedCountsForStage(stage, batch.processed),
        limit: batchLimit,
        startedAt: result.startedAt,
        finishedAt: result.finishedAt,
      };
      this.lastError = null;
      return result;
    } catch (error) {
      this.lastError = error instanceof Error ? error.message : 'Unknown ETL error';
      throw error;
    }
  }

  getStatus() {
    const totalProcessed = this.lastRun
      ? Object.values(this.lastRun.processed).reduce((sum, count) => sum + count, 0)
      : 0;

    return {
      lastRunAt: this.lastRun?.finishedAt ?? null,
      lastStatus: this.lastError ? 'error' : this.lastRun ? 'success' : 'never_run',
      lastProcessedEvents: totalProcessed,
      lastError: this.lastError,
    };
  }

  private async loadUsers(limit: number, after?: string): Promise<EtlBatchResult> {
    const query = this.paginatedCollection('users', limit, after);
    const snapshot = await query.get();
    await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        await this.getOrCreateUserKey(
          doc.id,
          this.stringValue(data.displayName),
          this.stringValue(data.email),
          this.stringValue(data.role) ?? 'customer',
        );
      }),
    );
    return this.batchResult(snapshot, limit);
  }

  private async loadBrands(limit: number, after?: string): Promise<EtlBatchResult> {
    const query = this.paginatedCollection('brands', limit, after);
    const snapshot = await query.get();
    await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        await this.getOrCreateBrandKey(doc.id, this.stringValue(data.name) ?? doc.id);
      }),
    );
    return this.batchResult(snapshot, limit);
  }

  private async loadVehicles(limit: number, after?: string): Promise<EtlBatchResult> {
    const query = this.paginatedCollection('vehicles', limit, after);
    const snapshot = await query.get();
    await Promise.all(snapshot.docs.map((doc) => this.getOrCreateVehicleKey(doc.id)));
    return this.batchResult(snapshot, limit);
  }

  private async loadVehicleViews(limit: number): Promise<EtlBatchResult> {
    const snapshot = await this.unsynced('vehicle_views', limit).get();

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const vehicleId = this.requiredString(data.vehicleId, 'vehicleId');
      const userKey = await this.getOrCreateUserKey(this.requiredString(data.userId, 'userId'));
      const vehicleKey = await this.getOrCreateVehicleKey(vehicleId);
      const brandKey = await this.getBrandKeyForVehicle(vehicleId);
      const eventDate = this.toDate(data.viewedAt) ?? new Date();
      const dateKey = await this.getOrCreateDateKey(eventDate);

      await this.insertInteraction(
        doc.id,
        userKey,
        vehicleKey,
        brandKey,
        dateKey,
        'view',
        eventDate,
      );
      await this.markSynced('vehicle_views', doc.id);
    }

    return { processed: snapshot.size, nextCursor: null };
  }

  private async loadFavorites(limit: number): Promise<EtlBatchResult> {
    const snapshot = await this.unsynced('favorites', limit).get();

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const vehicleId = this.requiredString(data.vehicleId, 'vehicleId');
      const userKey = await this.getOrCreateUserKey(this.requiredString(data.userId, 'userId'));
      const vehicleKey = await this.getOrCreateVehicleKey(vehicleId);
      const brandKey = await this.getBrandKeyForVehicle(vehicleId);
      const eventDate = this.toDate(data.createdAt) ?? new Date();
      const dateKey = await this.getOrCreateDateKey(eventDate);

      await this.insertInteraction(
        doc.id,
        userKey,
        vehicleKey,
        brandKey,
        dateKey,
        'favorite',
        eventDate,
      );
      await this.markSynced('favorites', doc.id);
    }

    return { processed: snapshot.size, nextCursor: null };
  }

  private async loadComparisons(limit: number): Promise<EtlBatchResult> {
    const snapshot = await this.unsynced('vehicle_comparisons', limit).get();

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const userKey = await this.getOrCreateUserKey(this.requiredString(data.userId, 'userId'));
      const firstVehicleId = this.requiredString(data.firstVehicleId, 'firstVehicleId');
      const secondVehicleId = this.requiredString(data.secondVehicleId, 'secondVehicleId');
      const eventDate = this.toDate(data.comparedAt) ?? new Date();
      const dateKey = await this.getOrCreateDateKey(eventDate);
      const firstVehicleKey = await this.getOrCreateVehicleKey(firstVehicleId);
      const firstBrandKey = await this.getBrandKeyForVehicle(firstVehicleId);

      await this.insertInteraction(
        doc.id,
        userKey,
        firstVehicleKey,
        firstBrandKey,
        dateKey,
        'compare',
        eventDate,
      );

      for (const vehicleId of [firstVehicleId, secondVehicleId]) {
        const vehicleKey = await this.getOrCreateVehicleKey(vehicleId);
        const brandKey = await this.getBrandKeyForVehicle(vehicleId);
        await this.warehouseDb.query(
          `
          INSERT INTO fact_comparison_vehicles (
            firestore_comparison_id,
            user_key,
            vehicle_key,
            brand_key,
            date_key,
            compared_at
          )
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (firestore_comparison_id, vehicle_key) DO NOTHING
          `,
          [doc.id, userKey, vehicleKey, brandKey, dateKey, eventDate],
        );
      }

      await this.markSynced('vehicle_comparisons', doc.id);
    }

    return { processed: snapshot.size, nextCursor: null };
  }

  private async loadCreditSimulations(limit: number): Promise<EtlBatchResult> {
    const snapshot = await this.unsynced('credit_simulations', limit).get();

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const vehicleId = this.requiredString(data.vehicleId, 'vehicleId');
      const userKey = await this.getOrCreateUserKey(this.requiredString(data.userId, 'userId'));
      const vehicleKey = await this.getOrCreateVehicleKey(vehicleId);
      const brandKey = await this.getBrandKeyForVehicle(vehicleId);
      const eventDate = this.toDate(data.simulatedAt) ?? new Date();
      const dateKey = await this.getOrCreateDateKey(eventDate);

      await this.warehouseDb.query(
        `
        INSERT INTO fact_credit_simulations (
          firestore_simulation_id,
          user_key,
          vehicle_key,
          brand_key,
          date_key,
          vehicle_price,
          down_payment,
          amount_financed,
          term_months,
          interest_rate,
          estimated_monthly_payment,
          simulated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (firestore_simulation_id) DO NOTHING
        `,
        [
          doc.id,
          userKey,
          vehicleKey,
          brandKey,
          dateKey,
          this.numberValue(data.vehiclePrice),
          this.numberValue(data.downPayment),
          this.numberValue(data.amountFinanced),
          this.numberValue(data.termMonths),
          this.numberValue(data.interestRate),
          this.numberValue(data.estimatedMonthlyPayment),
          eventDate,
        ],
      );
      await this.markSynced('credit_simulations', doc.id);
    }

    return { processed: snapshot.size, nextCursor: null };
  }

  private unsynced(collection: string, limit: number) {
    return this.db.collection(collection).where('syncedToWarehouse', '==', false).limit(limit);
  }

  private async markSynced(collection: string, id: string) {
    await this.db.collection(collection).doc(id).set(
      {
        syncedToWarehouse: true,
        syncedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  }

  private async getOrCreateUserKey(
    firebaseUid: string,
    name?: string,
    email?: string,
    role = 'customer',
  ): Promise<number> {
    const result = await this.warehouseDb.query<{ user_key: number }>(
      `
      INSERT INTO dim_users (firebase_uid, name, email, role, updated_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (firebase_uid) DO UPDATE SET
        name = COALESCE(EXCLUDED.name, dim_users.name),
        email = COALESCE(EXCLUDED.email, dim_users.email),
        role = COALESCE(EXCLUDED.role, dim_users.role),
        updated_at = NOW()
      RETURNING user_key
      `,
      [firebaseUid, name, email, role],
    );
    return result.rows[0].user_key;
  }

  private async getOrCreateBrandKey(firestoreBrandId: string, brandName: string): Promise<number> {
    const result = await this.warehouseDb.query<{ brand_key: number }>(
      `
      INSERT INTO dim_brands (firestore_brand_id, brand_name, updated_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (firestore_brand_id) DO UPDATE SET
        brand_name = EXCLUDED.brand_name,
        updated_at = NOW()
      RETURNING brand_key
      `,
      [firestoreBrandId, brandName],
    );
    return result.rows[0].brand_key;
  }

  private async getOrCreateVehicleKey(firestoreVehicleId: string): Promise<number> {
    const vehicleSnap = await this.db.collection('vehicles').doc(firestoreVehicleId).get();
    const vehicle = vehicleSnap.data() as VehicleDoc | undefined;
    const brandKey = vehicle?.brandId ? await this.getBrandKeyFromFirestore(vehicle.brandId) : null;

    const result = await this.warehouseDb.query<{ vehicle_key: number }>(
      `
      INSERT INTO dim_vehicles (
        firestore_vehicle_id,
        model,
        brand_key,
        type,
        year,
        price,
        mileage,
        fuel_type,
        transmission,
        seats,
        engine,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      ON CONFLICT (firestore_vehicle_id) DO UPDATE SET
        model = EXCLUDED.model,
        brand_key = EXCLUDED.brand_key,
        type = EXCLUDED.type,
        year = EXCLUDED.year,
        price = EXCLUDED.price,
        mileage = EXCLUDED.mileage,
        fuel_type = EXCLUDED.fuel_type,
        transmission = EXCLUDED.transmission,
        seats = EXCLUDED.seats,
        engine = EXCLUDED.engine,
        updated_at = NOW()
      RETURNING vehicle_key
      `,
      [
        firestoreVehicleId,
        vehicle?.model ?? firestoreVehicleId,
        brandKey,
        vehicle?.type,
        this.numberValue(vehicle?.year),
        this.numberValue(vehicle?.price),
        this.numberValue(vehicle?.mileage),
        vehicle?.fuelType,
        vehicle?.transmission,
        this.numberValue(vehicle?.seats),
        vehicle?.engine,
      ],
    );
    return result.rows[0].vehicle_key;
  }

  private async getBrandKeyForVehicle(firestoreVehicleId: string): Promise<number | null> {
    const vehicleSnap = await this.db.collection('vehicles').doc(firestoreVehicleId).get();
    const vehicle = vehicleSnap.data() as VehicleDoc | undefined;
    return vehicle?.brandId ? this.getBrandKeyFromFirestore(vehicle.brandId) : null;
  }

  private async getBrandKeyFromFirestore(firestoreBrandId: string): Promise<number> {
    const brandSnap = await this.db.collection('brands').doc(firestoreBrandId).get();
    const brandName = this.stringValue(brandSnap.data()?.name) ?? firestoreBrandId;
    return this.getOrCreateBrandKey(firestoreBrandId, brandName);
  }

  private async getOrCreateDateKey(date: Date): Promise<number> {
    const dateKey = this.dateKey(date);
    const fullDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const monthName = fullDate.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });
    const weekdayName = fullDate.toLocaleString('en-US', { weekday: 'long', timeZone: 'UTC' });

    await this.warehouseDb.query(
      `
      INSERT INTO dim_date (
        date_key,
        full_date,
        day,
        month,
        month_name,
        quarter,
        year,
        weekday,
        weekday_name
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (date_key) DO NOTHING
      `,
      [
        dateKey,
        fullDate,
        fullDate.getUTCDate(),
        fullDate.getUTCMonth() + 1,
        monthName,
        Math.floor(fullDate.getUTCMonth() / 3) + 1,
        fullDate.getUTCFullYear(),
        fullDate.getUTCDay(),
        weekdayName,
      ],
    );

    return dateKey;
  }

  private async insertInteraction(
    firestoreEventId: string,
    userKey: number,
    vehicleKey: number | null,
    brandKey: number | null,
    dateKey: number,
    interactionType: 'view' | 'compare' | 'favorite',
    eventDate: Date,
  ) {
    await this.warehouseDb.query(
      `
      INSERT INTO fact_interactions (
        firestore_event_id,
        user_key,
        vehicle_key,
        brand_key,
        date_key,
        interaction_type,
        interaction_count,
        event_timestamp
      )
      VALUES ($1, $2, $3, $4, $5, $6, 1, $7)
      ON CONFLICT (firestore_event_id) DO NOTHING
      `,
      [firestoreEventId, userKey, vehicleKey, brandKey, dateKey, interactionType, eventDate],
    );
  }

  private toDate(value: FirestoreDate): Date | undefined {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    if (typeof value === 'string') return new Date(value);
    return value.toDate?.();
  }

  private dateKey(date: Date): number {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return Number(`${year}${month}${day}`);
  }

  private requiredString(value: unknown, field: string): string {
    if (typeof value !== 'string' || value.length === 0) {
      throw new Error(`Missing required field ${field}`);
    }
    return value;
  }

  private stringValue(value: unknown): string | undefined {
    return typeof value === 'string' && value.length > 0 ? value : undefined;
  }

  private numberValue(value: unknown): number | null {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : null;
    }

    if (typeof value === 'string') {
      const trimmedValue = value.trim();

      if (trimmedValue.length === 0) {
        return null;
      }

      const numericValue = Number(trimmedValue);
      return Number.isFinite(numericValue) ? numericValue : null;
    }

    return null;
  }

  private async runStageLoader(stage: EtlStage, limit: number, after?: string): Promise<EtlBatchResult> {
    switch (stage) {
      case 'users':
        return this.loadUsers(limit, after);
      case 'brands':
        return this.loadBrands(limit, after);
      case 'vehicles':
        return this.loadVehicles(limit, after);
      case 'vehicleViews':
        return this.loadVehicleViews(limit);
      case 'favorites':
        return this.loadFavorites(limit);
      case 'comparisons':
        return this.loadComparisons(limit);
      case 'creditSimulations':
        return this.loadCreditSimulations(limit);
    }
  }

  private normalizeLimit(limit: number): number {
    if (!Number.isInteger(limit) || limit < 1) {
      return WarehouseEtlService.DEFAULT_BATCH_LIMIT;
    }

    return Math.min(limit, 500);
  }

  private processedCountsForStage(stage: EtlStage, processed: number): EtlProcessedCounts {
    return {
      users: stage === 'users' ? processed : 0,
      brands: stage === 'brands' ? processed : 0,
      vehicles: stage === 'vehicles' ? processed : 0,
      vehicleViews: stage === 'vehicleViews' ? processed : 0,
      favorites: stage === 'favorites' ? processed : 0,
      comparisons: stage === 'comparisons' ? processed : 0,
      creditSimulations: stage === 'creditSimulations' ? processed : 0,
    };
  }

  private paginatedCollection(collection: string, limit: number, after?: string) {
    let query = this.db
      .collection(collection)
      .orderBy(admin.firestore.FieldPath.documentId())
      .limit(limit);

    if (after) {
      query = query.startAfter(after);
    }

    return query;
  }

  private batchResult(
    snapshot: admin.firestore.QuerySnapshot<admin.firestore.DocumentData>,
    limit: number,
  ): EtlBatchResult {
    const lastDoc = snapshot.docs[snapshot.docs.length - 1];

    return {
      processed: snapshot.size,
      nextCursor: snapshot.size === limit && lastDoc ? lastDoc.id : null,
    };
  }
}
