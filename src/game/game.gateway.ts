// game.gateway.ts
import {
  WebSocketGateway,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  PLAYER_REPOSITORY,
  type PlayerRepository,
} from '../player/player.repository';
import { Inject, Logger } from '@nestjs/common';
import { GAME_REPOSITORY, type GameRepository } from './game.repository';
import { PairingRequestEntity } from 'src/pairing-request/pairing.request.entity';

@WebSocketGateway({
  cors: {
    origin: '*', // later restrict to frontend URL
  },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly logger: Logger,
    @Inject(PLAYER_REPOSITORY)
    private playerRepository: PlayerRepository,
    @Inject(GAME_REPOSITORY)
    private readonly gameRepository: GameRepository,
  ) {}

  handleConnection(socket: Socket) {
    this.logger.log(`Client connected: ${socket.id}`);
  }

  handleDisconnect(socket: Socket) {
    this.logger.log(`Client disconnected: ${socket.id}`);
    // await this.playersService.clearSocket(socket.id);
    // Optionally emit updated lobby
  }

  @SubscribeMessage('joinRoom')
  async onJoinRoom(
    socket: Socket,
    payload: { roomCode: string; playerId: string },
  ) {
    this.logger.log('Player joining room:', payload);
    await this.playerRepository.updateSocketId(payload.playerId, socket.id);
    await socket.join(payload.roomCode);

    const game = await this.gameRepository.findByCode(payload.roomCode);
    if (!game) {
      this.logger.log('Game not found');
      return;
    }

    const gameId = game.id;
    const players = await this.playerRepository.findByGameId(gameId);
    this.logger.log('Current players in room:', players);
    this.server.to(payload.roomCode).emit('updatePlayers', players);
  }

  @SubscribeMessage('toggleReady')
  async onToggleReady(
    socket: Socket,
    payload: { roomCode: string; playerId: string; isReady: boolean },
  ) {
    const game = await this.gameRepository.findByCode(payload.roomCode);
    if (!game) {
      this.logger.log('Game not found');
      return;
    }
    await this.playerRepository.toggleReady(payload.playerId, payload.isReady);
    const players = await this.playerRepository.findByGameId(game.id);
    this.server.to(payload.roomCode).emit('updatePlayers', players);
  }

  notifyPairingRequest(socketId: string, request: PairingRequestEntity) {
    this.server.to(socketId).emit('pairingRequest', request);
  }

  notifyPairingResponse(
    fromPlayerSocketId: string,
    toPlayerSocketId: string,
    requestId: string,
    response: 'accepted' | 'rejected',
  ) {
    this.server
      .to(fromPlayerSocketId)
      .emit('pairingResponse', { requestId, response });
    this.server
      .to(toPlayerSocketId)
      .emit('pairingResponse', { requestId, response });
  }
}
