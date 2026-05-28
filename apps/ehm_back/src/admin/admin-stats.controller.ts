import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../firebase/firebase-auth.guard';
import { AdminGuard } from './admin.guard';
import { AdminStatsService } from './admin-stats.service';

@Controller('api/admin/stats')
@UseGuards(FirebaseAuthGuard, AdminGuard)
export class AdminStatsController {
  constructor(private readonly adminStatsService: AdminStatsService) {}

  @Get('summary')
  getSummary() {
    return this.adminStatsService.getSummary();
  }

  @Get('brand-popularity')
  getBrandPopularity() {
    return this.adminStatsService.getBrandPopularity();
  }

  @Get('vehicle-popularity')
  getVehiclePopularity() {
    return this.adminStatsService.getVehiclePopularity();
  }

  @Get('credit-simulations')
  getCreditSimulations() {
    return this.adminStatsService.getCreditSimulations();
  }

  @Get('interactions-over-time')
  getInteractionsOverTime(@Query('from') from?: string, @Query('to') to?: string) {
    return this.adminStatsService.getInteractionsOverTime({ from, to });
  }

  @Get('vehicle-type-preferences')
  getVehicleTypePreferences() {
    return this.adminStatsService.getVehicleTypePreferences();
  }

  @Get('user-activity')
  getUserActivity() {
    return this.adminStatsService.getUserActivity();
  }
}
