import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DonationsService } from './donations.service';
import { DonationsController } from './donations.controller';
import { Donation } from './entities/donation.entity';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { DonationsGateway } from './donations.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Donation]), BlockchainModule],
  controllers: [DonationsController],
  providers: [DonationsService, DonationsGateway],
})
export class DonationsModule {}
