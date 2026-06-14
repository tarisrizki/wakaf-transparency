import { Controller, Get, Post, Body } from '@nestjs/common';
import { DonationsService, CreateDonationDto } from './donations.service';
import { BlockchainService } from '../blockchain/blockchain.service';

@Controller('donations')
export class DonationsController {
  constructor(
    private readonly donationsService: DonationsService,
    private readonly blockchainService: BlockchainService,
  ) {}

  @Post()
  create(@Body() dto: CreateDonationDto) {
    return this.donationsService.create(dto);
  }

  @Get()
  findAll() {
    return this.donationsService.findAll();
  }

  @Get('summary')
  getSummary() {
    return this.donationsService.getSummary();
  }

  @Get('audit')
  getAuditChain() {
    return this.blockchainService.getChain();
  }

  @Get('verify')
  verifyChain() {
    return this.blockchainService.verifyChain();
  }
}
