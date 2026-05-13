import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { FirebaseModule } from './firebase/firebase.module';

@Module({
  imports: [FirebaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}