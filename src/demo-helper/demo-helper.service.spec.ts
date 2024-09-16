import { Test, TestingModule } from '@nestjs/testing';
import { DemoHelperService } from './demo-helper.service';

describe('DemoHelperService', () => {
  let service: DemoHelperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DemoHelperService],
    }).compile();

    service = module.get<DemoHelperService>(DemoHelperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
