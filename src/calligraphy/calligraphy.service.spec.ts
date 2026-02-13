import { Test, TestingModule } from '@nestjs/testing';
import { CalligraphyService } from './calligraphy.service';

describe('CalligraphyService', () => {
  let service: CalligraphyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CalligraphyService],
    }).compile();

    service = module.get<CalligraphyService>(CalligraphyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
