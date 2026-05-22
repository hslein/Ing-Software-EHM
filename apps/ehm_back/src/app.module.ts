import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { FirebaseModule } from './firebase/firebase.module';
import { VehiclesModule } from './vehicles/vehicles.module';

@Module({
  imports: [FirebaseModule, VehiclesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}