import { Test, TestingModule } from '@nestjs/testing';
import { LotoController } from './loto.controller';
import { LotoService } from './loto.service';

describe('LotoController', () => {
  let controller: LotoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LotoController],
      providers: [LotoService],
    }).compile();

    controller = module.get<LotoController>(LotoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
