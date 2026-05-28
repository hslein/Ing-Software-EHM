import { Module } from '@nestjs/common';
import { UsersDetailsService } from './users-details.service';
import { UsersController } from './users.controller';

@Module({
  providers: [UsersDetailsService],
  controllers: [UsersController],
  exports: [UsersDetailsService],
})
export class UsersDetailsModule {}

export default UsersDetailsModule;
