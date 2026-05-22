import { Controller, Get, Put, Body, Param, Req, UseGuards } from '@nestjs/common';
import { UsersDetailsService } from './users-details.service';
import { FirebaseAuthGuard } from '../firebase/firebase-auth.guard';

@Controller('api/users-details')
export class UsersDetailsController {
  constructor(private readonly service: UsersDetailsService) {}

  // Get current user's details
  @UseGuards(FirebaseAuthGuard)
  @Get('me')
  async getMe(@Req() req: any) {
    const uid = req.user?.uid;
    return this.service.getByUid(uid, uid);
  }

  // Get specific UID (only allowed for same user)
  @UseGuards(FirebaseAuthGuard)
  @Get(':uid')
  async getByUid(@Param('uid') uid: string, @Req() req: any) {
    const requester = req.user?.uid;
    return this.service.getByUid(uid, requester);
  }

  // Upsert current user's details
  @UseGuards(FirebaseAuthGuard)
  @Put()
  async upsert(@Req() req: any, @Body() body: any) {
    const uid = req.user?.uid;
    return this.service.upsertForUid(uid, body, uid);
  }

  // List all users with details and role
  @UseGuards(FirebaseAuthGuard)
  @Get('all')
  async listAll() {
    return this.service.listAllUsers();
  }

  // Change user role
  @UseGuards(FirebaseAuthGuard)
  @Put(':uid/role')
  async updateRole(@Param('uid') uid: string, @Body('role') role: 'admin' | 'user') {
    return this.service.updateRole(uid, role);
  }
}

export default UsersDetailsController;
