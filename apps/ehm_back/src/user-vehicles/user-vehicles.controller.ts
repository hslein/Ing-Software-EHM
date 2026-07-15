import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../firebase/firebase-auth.guard';
import { CreateUserVehicleDto } from './dto/create-user-vehicle.dto';
import { UserVehiclesService } from './user-vehicles.service';

@Controller('api/my-vehicles')
@UseGuards(FirebaseAuthGuard)
export class UserVehiclesController {
  constructor(private readonly userVehiclesService: UserVehiclesService) {}

  @Get()
  findAll(@Req() req: { user?: { uid?: string } }) {
    return this.userVehiclesService.findAllByUser(req.user?.uid);
  }

  @Post()
  create(@Body() dto: CreateUserVehicleDto, @Req() req: { user?: { uid?: string } }) {
    return this.userVehiclesService.create(req.user?.uid, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: { user?: { uid?: string } }) {
    return this.userVehiclesService.remove(req.user?.uid, id);
  }
}
