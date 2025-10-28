import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { ProfessorsModule } from './professors/professors.module';
import { RatingsModule } from './ratings/ratings.module';
import { SeedModule } from './seed/seed.module';
import { TestController } from './test.controller';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: Number(configService.get('DB_PORT', 5432)),
        username: configService.get('DB_USER', 'postgres'),
        password: configService.get('DB_PASS', 'postgres'),
        database: configService.get('DB_NAME', 'qualifica'),
        autoLoadEntities: true,
        synchronize: configService.get('DB_SYNC', 'false') === 'true',
      }),
    }),
    CommonModule,
    UsersModule,
    AuthModule,
    ProfessorsModule,
    RatingsModule,
    SeedModule,
  ],
  controllers: [AppController, TestController],
})
export class AppModule {}
