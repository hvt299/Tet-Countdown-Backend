import { Test, TestingModule } from '@nestjs/testing';
import { BauCuaController } from './bau-cua.controller';
import { BauCuaService } from './bau-cua.service';

describe('BauCuaController', () => {
  let controller: BauCuaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BauCuaController],
      providers: [BauCuaService],
    }).compile();

    controller = module.get<BauCuaController>(BauCuaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
