import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DemoHelperService } from './demo-helper.service';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('demo-helper')
export class DemoHelperController {
  constructor(private readonly demoHelperService: DemoHelperService) {}
  @Public()
  @Post()
  async setUpForDemo() {
    return await this.demoHelperService.setUpForDemo();
  }
}
