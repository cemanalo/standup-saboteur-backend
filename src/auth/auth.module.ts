import { Logger, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { PlayerModule } from 'src/player/player.module';
import { AUTH_REPOSITORY, AuthRepositoryImpl } from './auth.repository';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'defaultSecret',
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
    PlayerModule,
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: AUTH_REPOSITORY,
      useClass: AuthRepositoryImpl,
    },
    Logger,
  ],
})
export class AuthModule {}
