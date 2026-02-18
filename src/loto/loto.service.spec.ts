import { Test, TestingModule } from '@nestjs/testing';
import { LotoService } from './loto.service';

describe('LotoService', () => {
  let service: LotoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LotoService],
    }).compile();

    service = module.get<LotoService>(LotoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
