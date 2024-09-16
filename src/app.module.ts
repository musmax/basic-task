import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';
import { ConfigModule } from '@nestjs/config';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { DemoHelperModule } from './demo-helper/demo-helper.module';
import { RolesGuard } from './auth/guards/roles.guard';
import { MediaModule } from './media/media.module';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [UserModule, AuthModule, DemoHelperModule,
    MulterModule.register({
      dest: './uploads',
    }),
    ConfigModule.forRoot({isGlobal:true}),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '66.29.152.104',
      port: 3306,
      username: 'ksdev',
      password: 'tempP@ss123',
      database: 'legal_ease',
      ssl: {
        rejectUnauthorized: false,
      },
      // host: 'localhost',
      // port: 3306,
      // username: 'root',
      // password: 'root',
      // database: 'foodco',
      // entities: [User],
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    MediaModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
