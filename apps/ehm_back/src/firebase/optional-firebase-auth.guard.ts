import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class OptionalFirebaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split('Bearer ')[1];

    if (!token) {
      return true;
    }

    try {
      request.user = await admin.auth().verifyIdToken(token);
    } catch {
      // Public reads stay available even if the token is invalid or expired.
    }

    return true;
  }
}
