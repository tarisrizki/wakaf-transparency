import {
  Controller, Get, Post, Body, Param, Query, UseGuards
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { DonationsService, CreateDonationDto } from './donations.service';
import { BlockchainService } from '../blockchain/blockchain.service';

@Controller('donations')
export class DonationsController {
  constructor(
    private readonly donationsService: DonationsService,
    private readonly blockchainService: BlockchainService,
  ) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.admin)
  @Post()
  async create(@Body() dto: CreateDonationDto) {
    try {
      return await this.donationsService.create(dto);
    } catch (error) {
      console.error('DONATION ERROR:', error);
      throw error;
    }
  }

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.donationsService.findAll({ search, type, startDate, endDate });
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.donationsService.findOne(id);
  }
}