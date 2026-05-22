import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import * as admin from 'firebase-admin';

export type UserDetails = {
  name?: string | null;
  birthdate?: string | null;
  more?: string | null;
  role?: 'admin' | 'user';
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type UserSummary = {
  uid: string;
  email: string | null;
  role: 'admin' | 'user';
  createdAt?: unknown;
};

@Injectable()
export class UsersDetailsService {
  private readonly db = admin.firestore();

  private normalizeDetails(data: UserDetails | undefined): UserDetails {
    return {
      role: data?.role ?? 'user',
      name: data?.name ?? null,
      birthdate: data?.birthdate ?? null,
      more: data?.more ?? null,
      createdAt: data?.createdAt,
      updatedAt: data?.updatedAt,
    };
  }

  async getByUid(uid: string, requesterUid?: string): Promise<UserDetails | null> {
    if (!uid) return null;
    // Simple authorization: allow if requester is same user
    if (requesterUid && requesterUid !== uid) {
      throw new ForbiddenException('Not allowed');
    }

    const ref = this.db.collection('users-details').doc(uid);
    const snap = await ref.get();
    if (!snap.exists) return null;
    return snap.data() as UserDetails;
  }

  async upsertForUid(uid: string, data: Partial<UserDetails>, requesterUid?: string) {
    if (!uid) throw new NotFoundException('UID required');
    if (requesterUid && requesterUid !== uid) {
      throw new ForbiddenException('Not allowed');
    }

    const ref = this.db.collection('users-details').doc(uid);
    const existing = await ref.get();
    const existingData = existing.exists ? (existing.data() as UserDetails) : undefined;

    const payload = {
      ...data,
      role: existingData?.role ?? 'user',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    } as any;

    if (!existing.exists) {
      await ref.set({ ...payload, createdAt: admin.firestore.FieldValue.serverTimestamp() });
    } else {
      await ref.set(payload, { merge: true });
    }

    const doc = await ref.get();
    return this.normalizeDetails(doc.data() as UserDetails);
  }

  async listAllUsers(): Promise<UserSummary[]> {
    const users: UserSummary[] = [];
    let nextPageToken: string | undefined;

    do {
      const authPage = await admin.auth().listUsers(1000, nextPageToken);
      await Promise.all(
        authPage.users.map(async (userRecord) => {
          const uid = userRecord.uid;
          const doc = await this.db.collection('users-details').doc(uid).get();
          const details = this.normalizeDetails(doc.exists ? (doc.data() as UserDetails) : undefined);

          users.push({
            uid,
            email: userRecord.email ?? null,
            role: details.role ?? 'user',
            createdAt: details.createdAt,
          });
        }),
      );
      nextPageToken = authPage.pageToken || undefined;
    } while (nextPageToken);

    return users;
  }

  async updateRole(uid: string, role: 'admin' | 'user'): Promise<UserSummary> {
    const ref = this.db.collection('users-details').doc(uid);
    const existing = await ref.get();
    const existingData = existing.exists ? (existing.data() as UserDetails) : undefined;

    const payload = {
      ...existingData,
      role,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    } as any;

    if (!existing.exists) {
      await ref.set({ ...payload, createdAt: admin.firestore.FieldValue.serverTimestamp() });
    } else {
      await ref.set(payload, { merge: true });
    }

    const userRecord = await admin.auth().getUser(uid);
    return {
      uid,
      email: userRecord.email ?? null,
      role,
    };
  }

  async deleteUser(uid: string): Promise<{ success: boolean }> {
    // Delete from Firebase Auth
    await admin.auth().deleteUser(uid);
    
    // Delete from Firestore users collection
    await this.db.collection('users').doc(uid).delete();
    
    // Delete from users-details collection
    await this.db.collection('users-details').doc(uid).delete();

    return { success: true };
  }
}

export default UsersDetailsService;
