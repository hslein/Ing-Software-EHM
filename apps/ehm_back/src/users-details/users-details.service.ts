import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { UserDetails, UserSummary } from '../models/users.model';

@Injectable()
export class UsersDetailsService {
  private readonly db = admin.firestore();

  private normalizeDetails(data: UserDetails | undefined): UserDetails {
    return {
      role: data?.role ?? 'customer',
      email: data?.email ?? undefined,
      displayName: data?.displayName ?? undefined,
      birthdate: data?.birthdate ?? undefined,
      createdAt: data?.createdAt,
      updatedAt: data?.updatedAt,
    };
  }

  async getCurrentUserDetails(uid: string): Promise<UserDetails> {
    if (!uid) throw new NotFoundException('UID required');

    const ref = this.db.collection('users').doc(uid);
    const snap = await ref.get();
    return this.normalizeDetails(snap.exists ? (snap.data() as UserDetails) : undefined);
  }

  async getRoleForUid(uid: string): Promise<'admin' | 'customer'> {
    const details = await this.getCurrentUserDetails(uid);
    return details.role ?? 'customer';
  }

  async assertAdmin(uid: string) {
    const role = await this.getRoleForUid(uid);
    if (role !== 'admin') {
      throw new ForbiddenException('Admin role required');
    }
  }

  async getByUid(uid: string, requesterUid?: string): Promise<UserDetails | null> {
    if (!uid) return null;
    // Simple authorization: allow if requester is same user
    if (requesterUid && requesterUid !== uid) {
      throw new ForbiddenException('Not allowed');
    }

    const ref = this.db.collection('users').doc(uid);
    const snap = await ref.get();
    if (!snap.exists) return null;
    return snap.data() as UserDetails;
  }

  async upsertForUid(uid: string, data: Partial<UserDetails>, requesterUid?: string) {
    if (!uid) throw new NotFoundException('UID required');
    if (requesterUid && requesterUid !== uid) {
      throw new ForbiddenException('Not allowed');
    }

    const ref = this.db.collection('users').doc(uid);
    const existing = await ref.get();
    const existingData = existing.exists ? (existing.data() as UserDetails) : undefined;

    const payload = {
      ...data,
      role: existingData?.role ?? 'customer',
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
          const doc = await this.db.collection('users').doc(uid).get();
          const details = this.normalizeDetails(doc.exists ? (doc.data() as UserDetails) : undefined);

          users.push({
            uid,
            email: userRecord.email ?? null,
            role: details.role ?? 'customer',
            createdAt: userRecord.metadata.creationTime,
          });
        }),
      );
      nextPageToken = authPage.pageToken || undefined;
    } while (nextPageToken);

    return users;
  }

  async updateRole(uid: string, role: 'admin' | 'customer'): Promise<UserSummary> {
    const ref = this.db.collection('users').doc(uid);
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
      createdAt: userRecord.metadata.creationTime,
    };
  }

  async deleteUser(uid: string): Promise<{ success: boolean }> {
    // Delete from Firebase Auth
    await admin.auth().deleteUser(uid);
    
    // Delete from Firestore users collection
    await this.db.collection('users').doc(uid).delete();
    

    return { success: true };
  }
}

export default UsersDetailsService;
