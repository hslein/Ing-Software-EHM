import { Module } from '@nestjs/common';
import { UsersDetailsService } from './users-details.service';
import { UsersDetailsController } from './users-details.controller';
import { UsersController } from './users.controller';

@Module({
  providers: [UsersDetailsService],
  controllers: [UsersDetailsController, UsersController],
  exports: [UsersDetailsService],
})
export class UsersDetailsModule {}

export default UsersDetailsModule;
