import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Block } from './entities/block.entity';
import * as crypto from 'crypto';

@Injectable()
export class BlockchainService {
  constructor(
    @InjectRepository(Block)
    private readonly blockRepository: Repository<Block>,
  ) {}

  private computeHash(
    index: number,
    previousHash: string,
    timestamp: string,
    data: object,
  ): string {
    const content = `${index}${previousHash}${timestamp}${JSON.stringify(data)}`;
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  async addBlock(data: object, action: string, actor?: string): Promise<Block> {
    const blocks = await this.blockRepository.find({
      order: { blockIndex: 'DESC' },
      take: 1,
    });
    const lastBlock = blocks[0] || null;

    const blockIndex = lastBlock ? lastBlock.blockIndex + 1 : 0;
    const previousHash = lastBlock ? lastBlock.hash : '0'.repeat(64);
    const timestamp = new Date().toISOString();
    const hash = this.computeHash(blockIndex, previousHash, timestamp, data);

    const block = this.blockRepository.create({
      blockIndex,
      previousHash,
      hash,
      data,
      action,
      actor,
    });

    return this.blockRepository.save(block);
  }

  async verifyChain(): Promise<{ valid: boolean; brokenAt?: number }> {
    const blocks = await this.blockRepository.find({
      order: { blockIndex: 'ASC' },
    });

    for (let i = 1; i < blocks.length; i++) {
      const current = blocks[i];
      const previous = blocks[i - 1];
      if (current.previousHash !== previous.hash) {
        return { valid: false, brokenAt: current.blockIndex };
      }
    }

    return { valid: true };
  }

  async getChain(): Promise<Block[]> {
    return this.blockRepository.find({ order: { blockIndex: 'ASC' } });
  }
}
