import { Test, TestingModule } from '@nestjs/testing';
import { LuckyBudsService } from './lucky-buds.service';

describe('LuckyBudsService', () => {
  let service: LuckyBudsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LuckyBudsService],
    }).compile();

    service = module.get<LuckyBudsService>(LuckyBudsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
