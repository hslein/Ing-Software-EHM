import { Module } from '@nestjs/common';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import * as admin from 'firebase-admin';

const serviceAccountPath =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ??
  join(
    process.cwd(),
    'apps',
    'ehm_back',
    'src',
    'config',
    'firebase.service-account.json',
  );

@Module({
  providers: [
    {
      provide: 'FIREBASE_ADMIN',
      useFactory: () => {
        if (admin.apps.length) {
          return admin.app();
        }

        if (!existsSync(serviceAccountPath)) {
          throw new Error(
            `Firebase service account file not found at ${serviceAccountPath}`,
          );
        }

        return admin.initializeApp({
          credential: admin.credential.cert(serviceAccountPath),
        });
      },
    },
  ],
  exports: ['FIREBASE_ADMIN'],
})
export class FirebaseModule {}
