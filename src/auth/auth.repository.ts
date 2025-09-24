import { Inject, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  PLAYER_REPOSITORY,
  type PlayerRepository,
} from 'src/player/player.repository';

export const AUTH_REPOSITORY = Symbol('AUTH_REPOSITORY');

export type Payload = {
  playerId: string;
  gameId: string;
  avatarSeed: string;
};

export interface AuthRepository {
  signin(name: string, pin: string, gameId: string): Promise<string | null>;
  verifyToken(token: string): Promise<Payload | null>;
}

export class AuthRepositoryImpl implements AuthRepository {
  constructor(
    private readonly logger: Logger,
    @Inject(PLAYER_REPOSITORY)
    private readonly playerRepository: PlayerRepository,
    private readonly jwtService: JwtService,
  ) {}

  async signin(
    name: string,
    pin: string,
    gameId: string,
  ): Promise<string | null> {
    this.logger.log('Signin attempt:', { name, gameId });
    const encodedPin = Buffer.from(pin.toString()).toString('base64');
    const player = await this.playerRepository.findByNameAndGameId(
      name,
      gameId,
    );

    this.logger.log('Player fetched for signin:', player);

    if (!player || player.pin !== encodedPin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = await this.jwtService.signAsync({
      playerId: player.id,
      gameId: player.gameId,
      avatarSeed: player.avatarSeed,
    });

    this.logger.log('Generated JWT token:', token);
    return token;
  }

  async verifyToken(token: string): Promise<Payload | null> {
    return await this.jwtService.verifyAsync<Payload>(token);
  }
}
