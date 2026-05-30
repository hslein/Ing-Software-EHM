export class CreateCreditSimulationEventDto {
  vehicleId!: string;
  vehiclePrice!: number;
  downPayment!: number;
  amountFinanced!: number;
  termMonths!: number;
  interestRate!: number;
  estimatedMonthlyPayment!: number;
}
