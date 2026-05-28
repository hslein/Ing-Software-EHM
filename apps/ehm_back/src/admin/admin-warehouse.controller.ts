import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../firebase/firebase-auth.guard';
import { AdminGuard } from './admin.guard';
import { WarehouseEtlService } from './warehouse-etl.service';

@Controller('api/admin/warehouse')
@UseGuards(FirebaseAuthGuard, AdminGuard)
export class AdminWarehouseController {
  constructor(private readonly warehouseEtlService: WarehouseEtlService) {}

  @Post('run-etl')
  runEtl() {
    return this.warehouseEtlService.run();
  }

  @Get('status')
  getStatus() {
    return this.warehouseEtlService.getStatus();
  }
}
