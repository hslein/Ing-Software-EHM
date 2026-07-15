import { Module } from '@nestjs/common';
import { UserVehiclesController } from './user-vehicles.controller';
import { UserVehiclesService } from './user-vehicles.service';

@Module({
  controllers: [UserVehiclesController],
  providers: [UserVehiclesService],
})
export class UserVehiclesModule {}
