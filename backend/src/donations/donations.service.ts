import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { Donation, DonationType } from './entities/donation.entity';
import { BlockchainService } from '../blockchain/blockchain.service';

export class CreateDonationDto {
  @IsString()
  donorName: string;

  @IsNumber()
  amount: number;

  @IsEnum(DonationType)
  type: DonationType;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

@Injectable()
export class DonationsService {
  constructor(
    @InjectRepository(Donation)
    private readonly donationRepository: Repository<Donation>,
    private readonly blockchainService: BlockchainService,
  ) {}

  async create(dto: CreateDonationDto): Promise<Donation> {
    const donation = this.donationRepository.create(dto);
    const saved = await this.donationRepository.save(donation);

    await this.blockchainService.addBlock(
      {
        transactionId: saved.id,
        donorName: saved.donorName,
        amount: saved.amount,
        type: saved.type,
        category: saved.category,
        description: saved.description,
      },
      saved.type === DonationType.IN ? 'DONATION_IN' : 'FUND_OUT',
      saved.donorName,
    );

    return saved;
  }

  async findAll(): Promise<Donation[]> {
    return this.donationRepository.find({ order: { createdAt: 'DESC' } });
  }

  async getSummary() {
    const donations = await this.donationRepository.find();
    const totalIn = donations
      .filter((d) => d.type === DonationType.IN)
      .reduce((sum, d) => sum + Number(d.amount), 0);
    const totalOut = donations
      .filter((d) => d.type === DonationType.OUT)
      .reduce((sum, d) => sum + Number(d.amount), 0);

    return {
      totalIn,
      totalOut,
      balance: totalIn - totalOut,
      transactions: donations.length,
    };
  }
}
