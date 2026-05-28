import { Module } from '@nestjs/common';
import { UsersDetailsModule } from '../users-details/users-details.module';
import { AdminGuard } from './admin.guard';
import { AdminStatsController } from './admin-stats.controller';
import { AdminStatsService } from './admin-stats.service';
import { AdminWarehouseController } from './admin-warehouse.controller';
import { WarehouseDbService } from './warehouse-db.service';
import { WarehouseEtlService } from './warehouse-etl.service';

@Module({
  imports: [UsersDetailsModule],
  controllers: [AdminStatsController, AdminWarehouseController],
  providers: [AdminGuard, AdminStatsService, WarehouseDbService, WarehouseEtlService],
})
export class AdminModule {}
