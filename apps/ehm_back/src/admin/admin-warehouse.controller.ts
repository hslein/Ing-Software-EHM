import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../firebase/firebase-auth.guard';
import { AdminGuard } from './admin.guard';
import { WarehouseEtlService } from './warehouse-etl.service';

@Controller('api/admin/warehouse')
@UseGuards(FirebaseAuthGuard, AdminGuard)
export class AdminWarehouseController {
  constructor(private readonly warehouseEtlService: WarehouseEtlService) {}

  @Post('run-etl')
  runEtl(@Query('limit') limit?: string) {
    return this.warehouseEtlService.run(this.parseLimit(limit));
  }

  @Post('run-etl/users')
  runUsers(@Query('limit') limit?: string, @Query('after') after?: string) {
    return this.warehouseEtlService.runStage('users', this.parseLimit(limit), after);
  }

  @Post('run-etl/brands')
  runBrands(@Query('limit') limit?: string, @Query('after') after?: string) {
    return this.warehouseEtlService.runStage('brands', this.parseLimit(limit), after);
  }

  @Post('run-etl/vehicles')
  runVehicles(@Query('limit') limit?: string, @Query('after') after?: string) {
    return this.warehouseEtlService.runStage('vehicles', this.parseLimit(limit), after);
  }

  @Post('run-etl/vehicle-views')
  runVehicleViews(@Query('limit') limit?: string) {
    return this.warehouseEtlService.runStage('vehicleViews', this.parseLimit(limit));
  }

  @Post('run-etl/favorites')
  runFavorites(@Query('limit') limit?: string) {
    return this.warehouseEtlService.runStage('favorites', this.parseLimit(limit));
  }

  @Post('run-etl/comparisons')
  runComparisons(@Query('limit') limit?: string) {
    return this.warehouseEtlService.runStage('comparisons', this.parseLimit(limit));
  }

  @Post('run-etl/credit-simulations')
  runCreditSimulations(@Query('limit') limit?: string) {
    return this.warehouseEtlService.runStage('creditSimulations', this.parseLimit(limit));
  }

  @Get('status')
  getStatus() {
    return this.warehouseEtlService.getStatus();
  }

  private parseLimit(limit?: string): number | undefined {
    return limit ? Number(limit) : undefined;
  }
}
