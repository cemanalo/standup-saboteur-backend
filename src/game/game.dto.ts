export class CreateGameDto {
  ownerName: string;
  ownerPin: string;
  avatarSeed: string;
}

export class JoinGameDto {
  name: string;
  pin: string;
  avatarSeed: string;
}

export class StartGameDto {
  ownerId: string;
}

export class KickPlayerDto {
  ownerId: string
  targetPlayerId: string
}
