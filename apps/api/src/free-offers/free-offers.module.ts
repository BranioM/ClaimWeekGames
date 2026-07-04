import { Module } from '@nestjs/common';
import { FreeOffersController } from './free-offers.controller.js';
import { FreeOffersService } from './free-offers.service.js';

@Module({
  controllers: [FreeOffersController],
  providers: [FreeOffersService],
})
export class FreeOffersModule {}
