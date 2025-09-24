import {
  PLAYER_REPOSITORY,
  type PlayerRepository,
} from 'src/player/player.repository';
import { GAME_REPOSITORY, type GameRepository } from '../game.repository';
import { Inject, Injectable } from '@nestjs/common';
import { GameGateway } from '../game.gateway';

export interface StartGameInput {
  roomCode: string;
  ownerId: string;
}

@Injectable()
export class StartGameUseCase {
  constructor(
    @Inject(GAME_REPOSITORY)
    private readonly gameRepository: GameRepository,
    @Inject(PLAYER_REPOSITORY)
    private readonly playerRepository: PlayerRepository,
    private readonly gameGateway: GameGateway,
  ) {}

  async execute(input: StartGameInput): Promise<void> {
    const { roomCode, ownerId } = input;
    const game = await this.gameRepository.findByCode(roomCode);
    if (!game) {
      throw new Error('Game not found');
    }
    if (game.ownerId !== ownerId) {
      throw new Error('Only the owner can start the game');
    }

    const players = await this.playerRepository.findByGameId(game.id);
    if (players.length < 3) {
      throw new Error('At least 3 players are required to start the game');
    }
    const allReady = players.every((p) => p.isReady);
    if (!allReady) {
      throw new Error('All players must be ready to start the game');
    }

    // Assign roles randomly
    const shuffledPlayers = players.sort(() => 0.5 - Math.random());
    const numSaboteurs = Math.max(1, Math.floor(players.length / 4)); // 1 saboteur per 4 players, at least 1
    const saboteurs = shuffledPlayers.slice(0, numSaboteurs);
    const crew = shuffledPlayers.slice(numSaboteurs);
    const contributorFunnyNames = [
      'Code Monkey',
      'Bug Squasher',
      'Feature Fanatic',
      'Commit Champion',
      'Merge Master',
      'Refactor Ranger',
      'Debugging Dynamo',
      'Sprint Star',
    ];

    const blockerFunnyNames = [
      'The Glitch Witch',
      'Captain Crash',
      'The Lag Lord',
      'Buggy Bandit',
      'The Freeze Phantom',
      'Crash Commander',
      'The Delay Demon',
      'The Timeout Titan',
    ];
    // shuffle funny names
    contributorFunnyNames.sort(() => 0.5 - Math.random());
    blockerFunnyNames.sort(() => 0.5 - Math.random());

    await Promise.all(
      saboteurs.map((p, index) =>
        this.playerRepository.update(p.id, {
          role: 'blocker',
          funnyName: blockerFunnyNames[index],
        }),
      ),
    );
    await Promise.all(
      crew.map((p, index) =>
        this.playerRepository.update(p.id, {
          role: 'contributor',
          funnyName: contributorFunnyNames[index],
        }),
      ),
    );

    // Update game state to 'in_progress'
    await this.gameRepository.update(game.id, { status: 'in_progress' });
    this.gameGateway.server.to(roomCode).emit('gameStarted');
  }
}
