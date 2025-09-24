import { Test, TestingModule } from '@nestjs/testing';
import { PairingRequestController } from './pairing-request.controller';

describe('PairingRequestController', () => {
  let controller: PairingRequestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PairingRequestController],
    }).compile();

    controller = module.get<PairingRequestController>(PairingRequestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
