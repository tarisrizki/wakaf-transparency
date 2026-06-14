import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { Donation, DonationType } from './entities/donation.entity';
import { BlockchainService } from '../blockchain/blockchain.service';
import { DonationsGateway } from './donations.gateway';

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
    private readonly donationsGateway: DonationsGateway,
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

    this.donationsGateway.notifyNewDonation(saved);

    return saved;
  }

  async findAll(filters?: { search?: string; type?: string; startDate?: string; endDate?: string }): Promise<Donation[]> {
    const query = this.donationRepository.createQueryBuilder('donation')
      .orderBy('donation.createdAt', 'DESC');

    if (filters?.search) {
      query.andWhere('donation.donorName ILIKE :search', { search: `%${filters.search}%` });
    }

    if (filters?.type && filters.type !== 'all') {
      query.andWhere('donation.type = :type', { type: filters.type });
    }

    if (filters?.startDate) {
      query.andWhere('donation.createdAt >= :startDate', { startDate: new Date(filters.startDate) });
    }

    if (filters?.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      query.andWhere('donation.createdAt <= :endDate', { endDate: end });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<{ donation: Donation; block: any }> {
    const donation = await this.donationRepository.findOne({ where: { id } });
    if (!donation) {
      throw new NotFoundException('Donation not found');
    }
    const chain = await this.blockchainService.getChain();
    const block = chain.find((b) => b.data && (b.data as any).transactionId === id);
    return { donation, block: block || null };
  }

  async getSummary() {
    const result = await this.donationRepository
      .createQueryBuilder('donation')
      .select('donation.type', 'type')
      .addSelect('SUM(donation.amount)', 'total')
      .addSelect('COUNT(donation.id)', 'count')
      .groupBy('donation.type')
      .getRawMany();

    let totalIn = 0;
    let totalOut = 0;
    let transactions = 0;

    result.forEach((row) => {
      transactions += Number(row.count);
      if (row.type === DonationType.IN) totalIn += Number(row.total);
      if (row.type === DonationType.OUT) totalOut += Number(row.total);
    });

    return {
      totalIn,
      totalOut,
      balance: totalIn - totalOut,
      transactions,
    };
  }
}
