import {
  Controller, Get, Post, Body, UnauthorizedException,
} from '@nestjs/common';
import { DonationsService, CreateDonationDto } from './donations.service';
import { BlockchainService } from '../blockchain/blockchain.service';

@Controller('donations')
export class DonationsController {
  constructor(
    private readonly donationsService: DonationsService,
    private readonly blockchainService: BlockchainService,
  ) {}

  @Post('admin-login')
  adminLogin(@Body() body: { password: string }) {
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    if (body.password !== adminPassword) {
      throw new UnauthorizedException('Password salah');
    }
    const token = Buffer.from(
      JSON.stringify({ role: 'admin', ts: Date.now() }),
    ).toString('base64');
    return { token, message: 'Login berhasil' };
  }

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