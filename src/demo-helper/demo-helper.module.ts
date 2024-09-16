import { Module } from '@nestjs/common';
import { DemoHelperService } from './demo-helper.service';
import { DemoHelperController } from './demo-helper.controller';
import { UserModule } from 'src/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from 'src/auth/entities/role.entity';
import { Permission } from 'src/auth/entities/permission.entity';

@Module({
  controllers: [DemoHelperController],
  providers: [DemoHelperService],
  imports: [UserModule, TypeOrmModule.forFeature([Role, Permission])],
})
export class DemoHelperModule {}
