import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UsersDetailsService } from '../users-details/users-details.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly usersDetailsService: UsersDetailsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    await this.usersDetailsService.assertAdmin(request.user?.uid);
    return true;
  }
}
