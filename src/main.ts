import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DemoHelperService } from './demo-helper/demo-helper.service';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get DemoHelperService from the NestJS app context
  const demoHelperService = app.get(DemoHelperService);

  // Call the setup function to create demo data
  await demoHelperService.setUpForDemo();

  await app.listen(3002);
}
bootstrap();
