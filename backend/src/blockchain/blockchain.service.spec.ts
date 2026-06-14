import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BlockchainService } from './blockchain.service';
import { Block } from './entities/block.entity';

describe('BlockchainService', () => {
  let service: BlockchainService;
  
  // Create a mock repository
  let mockBlocks: any[] = [];
  
  const mockBlockRepository = {
    find: jest.fn().mockImplementation((query) => {
      if (query?.order?.blockIndex === 'DESC') {
        return Promise.resolve(mockBlocks.length > 0 ? [mockBlocks[mockBlocks.length - 1]] : []);
      }
      return Promise.resolve(mockBlocks);
    }),
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((block) => {
      mockBlocks.push(block);
      return Promise.resolve(block);
    }),
  };

  beforeEach(async () => {
    mockBlocks = []; // reset for each test
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockchainService,
        {
          provide: getRepositoryToken(Block),
          useValue: mockBlockRepository,
        },
      ],
    }).compile();

    service = module.get<BlockchainService>(BlockchainService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addBlock', () => {
    it('should create the genesis block (first block) correctly', async () => {
      const data = { amount: 100 };
      const block = await service.addBlock(data, 'DONATION_IN', 'John Doe');
      
      expect(block.blockIndex).toBe(0);
      expect(block.previousHash).toBe('0'.repeat(64));
      expect(block.action).toBe('DONATION_IN');
      expect(block.actor).toBe('John Doe');
      expect(block.hash).toBeDefined();
    });

    it('should create subsequent blocks linked to the previous block', async () => {
      await service.addBlock({ amount: 100 }, 'DONATION_IN', 'John Doe');
      const block2 = await service.addBlock({ amount: 50 }, 'FUND_OUT', 'Admin');
      
      expect(block2.blockIndex).toBe(1);
      expect(block2.previousHash).toBe(mockBlocks[0].hash);
    });
  });

  describe('verifyChain', () => {
    it('should return valid: true for a valid chain', async () => {
      await service.addBlock({ amount: 100 }, 'DONATION_IN', 'John');
      await service.addBlock({ amount: 50 }, 'DONATION_IN', 'Jane');
      
      const result = await service.verifyChain();
      expect(result.valid).toBe(true);
    });

    it('should return valid: false if a block was tampered with', async () => {
      await service.addBlock({ amount: 100 }, 'DONATION_IN', 'John');
      await service.addBlock({ amount: 50 }, 'DONATION_IN', 'Jane');
      await service.addBlock({ amount: 20 }, 'FUND_OUT', 'Admin');
      
      // Tamper with the middle block's hash
      mockBlocks[1].hash = 'tampered_hash';
      
      const result = await service.verifyChain();
      expect(result.valid).toBe(false);
      expect(result.brokenAt).toBe(2); // Block index 2 will fail because its previousHash doesn't match block 1's tampered hash
    });
  });
});
