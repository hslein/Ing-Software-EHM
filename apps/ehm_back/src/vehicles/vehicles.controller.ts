import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { FirebaseAuthGuard } from '../firebase/firebase-auth.guard';

@Controller('api')
@UseGuards(FirebaseAuthGuard)
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get('vehicles')
  findAll(@Query('brand') brand?: string) {
    return this.vehiclesService.findAll(brand);
  }

  @Get('vehicles/:id')
  findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(id);
  }

  @Post('vehicles')
  create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehiclesService.create(createVehicleDto);
  }

  @Put('vehicles/:id')
  update(
    @Param('id') id: string,
    @Body() updateVehicleDto: UpdateVehicleDto,
  ) {
    return this.vehiclesService.update(id, updateVehicleDto);
  }

  @Delete('vehicles/:id')
  remove(@Param('id') id: string) {
    return this.vehiclesService.remove(id);
  }

  @Get('brands')
  findBrands() {
    return this.vehiclesService.findBrands();
  }
}
