import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { DailyResultEntity } from 'src/daily-result/daily.result.entity';
import { CreateGameDto } from 'src/game/game.dto';
import { GameEntity } from 'src/game/game.entity';
import {
  CreatePairingRequestDto,
  RespondToPairingRequestDto,
} from 'src/pairing-request/pairing.request.dto';
import { PairingRequestEntity } from 'src/pairing-request/pairing.request.entity';
import { PlayerEntity } from 'src/player/player.entity';
import {
  PLAYER_REPOSITORY,
  PlayerRepository,
} from 'src/player/player.repository';
import request from 'supertest';

describe('Game E2E - lifecycle', () => {
  let app: INestApplication;
  let playerRepository: PlayerRepository;

  let gameId: string;
  let roomCode: string;
  let playerOwnerId: string;

  let playerOwner: PlayerEntity | null;
  let players: Array<PlayerEntity | null> = [];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    // how to get the player repository here?
    playerRepository = moduleRef.get<PlayerRepository>(PLAYER_REPOSITORY);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // step 1: create a new game
  it('should create a new game', async () => {
    const createGameDto: CreateGameDto = {
      ownerName: 'test_Alice',
      ownerPin: '1234',
      avatarSeed: 'avatar1',
    };
    const response = await request(app.getHttpServer())
      .post('/games')
      .send(createGameDto)
      .expect(201);

    const body: GameEntity = response.body as GameEntity;
    gameId = body.id;
    roomCode = body.roomCode;
    playerOwnerId = body.ownerId;

    playerOwner = await playerRepository.findById(playerOwnerId);
    players[0] = playerOwner;
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('roomCode');
    expect(body).toHaveProperty('ownerId');
  });

  // step 2: create joining players
  it('should create the first joining player', async () => {
    const response = await request(app.getHttpServer())
      .post(`/games/${roomCode}/join`)
      .send({
        name: 'test_Bob',
        pin: '5678',
        avatarSeed: 'avatar2',
        gameId: gameId,
      })
      .expect(201);

    const body: PlayerEntity = response.body as PlayerEntity;
    players[1] = body;

    expect(body).toHaveProperty('id');
    expect(body.name).toBe('test_Bob');
    expect(body.pin).toBe('5678');
    expect(body.gameId).toBe(gameId);
  });

  // step 3: create a second joining player
  it('should create the second joining player', async () => {
    const response = await request(app.getHttpServer())
      .post(`/games/${roomCode}/join`)
      .send({
        name: 'test_Charlie',
        pin: '9012',
        avatarSeed: 'avatar3',
        gameId: gameId,
      })
      .expect(201);

    const body: PlayerEntity = response.body as PlayerEntity;
    players[2] = body;

    expect(body).toHaveProperty('id');
    expect(body.name).toBe('test_Charlie');
    expect(body.pin).toBe('9012');
    expect(body.gameId).toBe(gameId);
  });

  // step 4: set players as ready
  it('should set all players as ready', async () => {
    // set owner as ready
    if (playerOwner && players[1] && players[2]) {
      playerOwner.isReady = true;
      players[1].isReady = true;
      players[2].isReady = true;

      const updateOwner = await playerRepository.save(playerOwner);
      const updatePlayer2 = await playerRepository.save(players[1]);
      const updatePlayer3 = await playerRepository.save(players[2]);

      expect(updateOwner.isReady).toBe(true);
      expect(updatePlayer2.isReady).toBe(true);
      expect(updatePlayer3.isReady).toBe(true);
    }
  });

  // step 5: start the game
  it('should start the game', async () => {
    await request(app.getHttpServer())
      .post(`/games/${roomCode}/start`)
      .send({
        ownerId: playerOwnerId,
      })
      .expect(201);

    const game = await request(app.getHttpServer())
      .get(`/games/${roomCode}`)
      .expect(200);
    const body: GameEntity = game.body as GameEntity;
    expect(body.status).toBe('in_progress');

    players = body.players;
    const roles = players.map((p) => p!.role);
    expect(roles).toContain('blocker');
    expect(roles).toContain('contributor');
  });

  // step 6: pair owner with player2
  it('should request pairing contributor to contributor', async () => {
    const contributors = players.filter((p) => p?.role === 'contributor');
    expect(contributors.length).toBe(2);

    const requestBody: CreatePairingRequestDto = {
      gameId,
      fromPlayerId: contributors[0]!.id,
      toPlayerId: contributors[1]!.id,
    };
    const response = await request(app.getHttpServer())
      .post(`/pairing-requests`)
      .send(requestBody)
      .expect(201);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body = response.body;
    expect(body).toHaveProperty('message');
  });

  // step 8: accept pairing request
  it('should accept pairing request', async () => {
    const contributors = players.filter((p) => p?.role === 'contributor');
    expect(contributors.length).toBe(2);

    // get contributor 1's pending requests today
    const pendingRequests = await request(app.getHttpServer())
      .get(`/pairing-requests/today/${contributors[1]!.id}`)
      .expect(200);

    const requests: Array<PairingRequestEntity> =
      pendingRequests.body as Array<PairingRequestEntity>;
    expect(requests.length).toBe(1);
    const pairingRequestId = requests[0].id;

    // respond to pairing request
    const respondRequest: RespondToPairingRequestDto = {
      requestId: pairingRequestId,
      response: 'accepted',
      gameId,
      fromPlayerId: contributors[0]!.id,
      toPlayerId: contributors[1]!.id,
    };

    const response = await request(app.getHttpServer())
      .post(`/pairing-requests/respond`)
      .send(respondRequest)
      .expect(201);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body = response.body;
    expect(body).toHaveProperty('message');

    // verify that the pairing request status is now 'accepted'
    const updatedRequests = await request(app.getHttpServer())
      .get(`/pairing-requests/today/${contributors[1]!.id}`)
      .expect(200);

    const updated: Array<PairingRequestEntity> =
      updatedRequests.body as Array<PairingRequestEntity>;
    expect(updated[0].status).toBe('accepted');

    // verify that both players are now paired with each other
    const pairings1 = await request(app.getHttpServer())
      .get(`/pairings?playerId=${contributors[0]!.id}&gameId=${gameId}`)
      .expect(200);

    const pairings2 = await request(app.getHttpServer())
      .get(`/pairings?playerId=${contributors[1]!.id}&gameId=${gameId}`)
      .expect(200);

    expect(pairings1.body).toHaveLength(1);
    expect(pairings2.body).toHaveLength(1);
  });

  it('should run trigger end of day', async () => {
    await request(app.getHttpServer())
      .post(`/daily-results/${gameId}/trigger-end-of-day`)
      .send({
        ownerId: playerOwnerId,
      })
      .expect(201);

    const dailyResult = await request(app.getHttpServer())
      .get(`/daily-results/${gameId}`)
      .expect(200);
    const body: DailyResultEntity[] = dailyResult.body as DailyResultEntity[];

    expect(body[0]).toHaveProperty('id');
    expect(body[0]).toHaveProperty('gameId');
    expect(body[0]).toHaveProperty('playerId');
    expect(body[0]).toHaveProperty('score');
    expect(body.length).toBe(3);

    const contributors = players.filter((p) => p?.role === 'contributor');

    const contributorResults = body.filter((r) =>
      contributors.some((c) => c?.id === r.playerId),
    );
    expect(contributorResults[0].score).toBe(1);
  });
});
