import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { FirebaseAuthGuard } from '../firebase/firebase-auth.guard';
import { OptionalFirebaseAuthGuard } from '../firebase/optional-firebase-auth.guard';

@Controller('api')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get('vehicles')
  @UseGuards(OptionalFirebaseAuthGuard)
  findAll(@Query('brandId') brandId?: string, @Req() req?: { user?: { uid?: string } }) {
    return this.vehiclesService.findAll(brandId, req?.user?.uid);
  }

  @Get('vehicles/favorites')
  @UseGuards(FirebaseAuthGuard)
  findFavorites(@Req() req: { user?: { uid?: string } }) {
    return this.vehiclesService.findFavorites(req.user?.uid);
  }

  @Get('vehicles/:id')
  @UseGuards(OptionalFirebaseAuthGuard)
  findOne(@Param('id') id: string, @Req() req?: { user?: { uid?: string } }) {
    return this.vehiclesService.findOne(id, req?.user?.uid);
  }

  @Post('vehicles')
  @UseGuards(FirebaseAuthGuard)
  create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehiclesService.create(createVehicleDto);
  }

  @Put('vehicles/:id')
  @UseGuards(FirebaseAuthGuard)
  update(@Param('id') id: string, @Body() updateVehicleDto: UpdateVehicleDto) {
    return this.vehiclesService.update(id, updateVehicleDto);
  }

  @Delete('vehicles/:id')
  @UseGuards(FirebaseAuthGuard)
  remove(@Param('id') id: string) {
    return this.vehiclesService.remove(id);
  }

  @Put('vehicles/:id/favorite')
  @UseGuards(FirebaseAuthGuard)
  setFavorite(
    @Param('id') id: string,
    @Body('favorite') favorite: boolean,
    @Req() req: { user?: { uid?: string } },
  ) {
    return this.vehiclesService.setFavorite(id, req.user?.uid, favorite);
  }

  @Get('brands')
  @UseGuards(OptionalFirebaseAuthGuard)
  findBrands() {
    return this.vehiclesService.findBrands();
  }

  @Get('brands/popular')
  @UseGuards(OptionalFirebaseAuthGuard)
  findPopularBrands(@Query('limit') limit?: string) {
    return this.vehiclesService.findPopularBrands(this.parseLimit(limit));
  }

  private parseLimit(value?: string): number {
    const parsedValue = Number(value);
    return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : 10;
  }
}
