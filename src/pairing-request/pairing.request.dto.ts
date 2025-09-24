export type CreatePairingRequestDto = {
  gameId: string;
  fromPlayerId: string;
  toPlayerId: string;
};

export type RespondToPairingRequestDto = {
  requestId: string;
  response: 'accepted' | 'rejected';
  gameId: string;
  fromPlayerId: string;
  toPlayerId: string;
};
