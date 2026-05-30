import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../firebase/firebase-auth.guard';
import { CreateCreditSimulationEventDto } from './dto/create-credit-simulation-event.dto';
import { CreateVehicleComparisonEventDto } from './dto/create-vehicle-comparison-event.dto';
import { CreateVehicleViewEventDto } from './dto/create-vehicle-view-event.dto';
import { InteractionEventsService } from './interaction-events.service';

@Controller('api/events')
@UseGuards(FirebaseAuthGuard)
export class InteractionEventsController {
  constructor(private readonly interactionEventsService: InteractionEventsService) {}

  @Post('vehicle-views')
  createVehicleView(@Body() dto: CreateVehicleViewEventDto, @Req() req: any) {
    return this.interactionEventsService.createVehicleView(req.user?.uid, dto);
  }

  @Post('vehicle-comparisons')
  createVehicleComparison(@Body() dto: CreateVehicleComparisonEventDto, @Req() req: any) {
    return this.interactionEventsService.createVehicleComparison(req.user?.uid, dto);
  }

  @Post('credit-simulations')
  createCreditSimulation(@Body() dto: CreateCreditSimulationEventDto, @Req() req: any) {
    return this.interactionEventsService.createCreditSimulation(req.user?.uid, dto);
  }
}
