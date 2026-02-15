import { Test, TestingModule } from '@nestjs/testing';
import { LuckyBudsController } from './lucky-buds.controller';
import { LuckyBudsService } from './lucky-buds.service';

describe('LuckyBudsController', () => {
  let controller: LuckyBudsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LuckyBudsController],
      providers: [LuckyBudsService],
    }).compile();

    controller = module.get<LuckyBudsController>(LuckyBudsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
