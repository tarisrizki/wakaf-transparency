import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockchainService } from './blockchain.service';
import { Block } from './entities/block.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Block])],
  providers: [BlockchainService],
  exports: [BlockchainService],
})
export class BlockchainModule {}
