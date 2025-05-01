import { Test, TestingModule } from '@nestjs/testing';
import { AiContentController } from './ai_content.controller';

describe('AiContentController', () => {
  let controller: AiContentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiContentController],
    }).compile();

    controller = module.get<AiContentController>(AiContentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
