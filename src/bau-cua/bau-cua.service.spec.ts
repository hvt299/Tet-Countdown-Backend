import { Test, TestingModule } from '@nestjs/testing';
import { BauCuaService } from './bau-cua.service';

describe('BauCuaService', () => {
  let service: BauCuaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BauCuaService],
    }).compile();

    service = module.get<BauCuaService>(BauCuaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
