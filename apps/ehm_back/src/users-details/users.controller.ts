import { Controller, Get, Put, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { UsersDetailsService } from './users-details.service';
import { FirebaseAuthGuard } from '../firebase/firebase-auth.guard';

@Controller('api/users')
export class UsersController {
  constructor(private readonly service: UsersDetailsService) {}

  @UseGuards(FirebaseAuthGuard)
  @Get()
  async listAll(@Req() req: any) {
    await this.service.assertAdmin(req.user?.uid);
    return this.service.listAllUsers();
  }

  @UseGuards(FirebaseAuthGuard)
  @Put(':uid/role')
  async updateRole(@Param('uid') uid: string, @Body('role') role: 'admin' | 'customer', @Req() req: any) {
    await this.service.assertAdmin(req.user?.uid);
    return this.service.updateRole(uid, role);
  }

  @UseGuards(FirebaseAuthGuard)
  @Delete(':uid')
  async deleteUser(@Param('uid') uid: string, @Req() req: any) {
    await this.service.assertAdmin(req.user?.uid);
    return this.service.deleteUser(uid);
  }

  @UseGuards(FirebaseAuthGuard)
  @Get(':uid')
  async getByUid(@Param('uid') uid: string, @Req() req: any) {
    const requester = req.user?.uid;
    return this.service.getByUid(uid, requester);
  }

  @UseGuards(FirebaseAuthGuard)
  @Put()
  async upsert(@Req() req: any, @Body() body: any) {
    const uid = req.user?.uid;
    return this.service.upsertForUid(uid, body, uid);
  }

}
