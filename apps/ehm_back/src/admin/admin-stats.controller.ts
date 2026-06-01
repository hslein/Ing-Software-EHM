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
  getInteractionsOverTime(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('brandKey') brandKey?: string,
    @Query('vehicleKey') vehicleKey?: string,
  ) {
    return this.adminStatsService.getInteractionsOverTime({
      from,
      to,
      brandKey: this.parseNumber(brandKey),
      vehicleKey: this.parseNumber(vehicleKey),
    });
  }

  @Get('vehicle-type-preferences')
  getVehicleTypePreferences() {
    return this.adminStatsService.getVehicleTypePreferences();
  }

  @Get('user-activity')
  getUserActivity() {
    return this.adminStatsService.getUserActivity();
  }

  @Get('business-insights')
  getBusinessInsights() {
    return this.adminStatsService.getBusinessInsights();
  }

  private parseNumber(value?: string): number | undefined {
    if (!value) {
      return undefined;
    }

    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : undefined;
  }
}
