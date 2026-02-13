import { Test, TestingModule } from '@nestjs/testing';
import { CalligraphyController } from './calligraphy.controller';
import { CalligraphyService } from './calligraphy.service';

describe('CalligraphyController', () => {
  let controller: CalligraphyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CalligraphyController],
      providers: [CalligraphyService],
    }).compile();

    controller = module.get<CalligraphyController>(CalligraphyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
