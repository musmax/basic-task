import { Test, TestingModule } from '@nestjs/testing';
import { DemoHelperController } from './demo-helper.controller';
import { DemoHelperService } from './demo-helper.service';

describe('DemoHelperController', () => {
  let controller: DemoHelperController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DemoHelperController],
      providers: [DemoHelperService],
    }).compile();

    controller = module.get<DemoHelperController>(DemoHelperController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
