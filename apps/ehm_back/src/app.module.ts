import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { FirebaseModule } from './firebase/firebase.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { UsersDetailsModule } from './users-details/users-details.module';
import { AdminModule } from './admin/admin.module';
import { InteractionEventsModule } from './interaction-events/interaction-events.module';
import { UserVehiclesModule } from './user-vehicles/user-vehicles.module';

@Module({
  imports: [
    FirebaseModule,
    VehiclesModule,
    UsersDetailsModule,
    AdminModule,
    InteractionEventsModule,
    UserVehiclesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
