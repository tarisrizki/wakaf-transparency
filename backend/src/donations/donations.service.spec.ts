import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DonationsService } from './donations.service';
import { Donation, DonationType } from './entities/donation.entity';
import { BlockchainService } from '../blockchain/blockchain.service';
import { DonationsGateway } from './donations.gateway';

describe('DonationsService', () => {
  let service: DonationsService;
  
  let mockDonations: any[] = [];

  const mockDonationRepository = {
    create: jest.fn().mockImplementation((dto) => {
      return { id: 'test-id', ...dto, createdAt: new Date() };
    }),
    save: jest.fn().mockImplementation((donation) => {
      mockDonations.push(donation);
      return Promise.resolve(donation);
    }),
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockImplementation(({ where: { id } }) => {
      const found = mockDonations.find((d) => d.id === id);
      return Promise.resolve(found || null);
    }),
    createQueryBuilder: jest.fn().mockImplementation(() => {
      return {
        orderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockDonations),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { type: 'in', total: '1000', count: '1' },
          { type: 'out', total: '500', count: '1' }
        ]),
      };
    }),
  };

  const mockBlockchainService = {
    addBlock: jest.fn().mockResolvedValue({}),
    getChain: jest.fn().mockResolvedValue([]),
  };

  const mockDonationsGateway = {
    notifyNewDonation: jest.fn(),
  };

  beforeEach(async () => {
    mockDonations = [];
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DonationsService,
        {
          provide: getRepositoryToken(Donation),
          useValue: mockDonationRepository,
        },
        {
          provide: BlockchainService,
          useValue: mockBlockchainService,
        },
        {
          provide: DonationsGateway,
          useValue: mockDonationsGateway,
        },
      ],
    }).compile();

    service = module.get<DonationsService>(DonationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a donation, hash it, and notify via websocket', async () => {
      const dto = {
        donorName: 'Test Donor',
        amount: 1000,
        type: DonationType.IN,
      };

      const result = await service.create(dto);

      expect(result).toBeDefined();
      expect(result.donorName).toBe('Test Donor');
      
      expect(mockDonationRepository.save).toHaveBeenCalled();
      expect(mockBlockchainService.addBlock).toHaveBeenCalledWith(
        expect.objectContaining({
          donorName: 'Test Donor',
          amount: 1000,
          type: 'in'
        }),
        'DONATION_IN',
        'Test Donor'
      );
      expect(mockDonationsGateway.notifyNewDonation).toHaveBeenCalledWith(result);
    });
  });

  describe('findAll', () => {
    it('should call createQueryBuilder and getMany', async () => {
      mockDonations.push({ id: 'test', donorName: 'John' });
      
      const result = await service.findAll({ search: 'John' });
      expect(result.length).toBe(1);
    });
  });

  describe('getSummary', () => {
    it('should calculate total in, out, and balance correctly', async () => {
      const result = await service.getSummary();
      
      expect(result.totalIn).toBe(1000);
      expect(result.totalOut).toBe(500);
      expect(result.balance).toBe(500);
      expect(result.transactions).toBe(2);
    });
  });
});
