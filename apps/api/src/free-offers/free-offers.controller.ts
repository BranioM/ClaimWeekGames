import { Controller, Get } from '@nestjs/common';
import { FreeOffersService } from './free-offers.service.js';

@Controller('free-offers')
export class FreeOffersController {
  constructor(private readonly freeOffersService: FreeOffersService) {}

  @Get()
  listActiveOffers() {
    return this.freeOffersService.listActiveOffers();
  }
}
