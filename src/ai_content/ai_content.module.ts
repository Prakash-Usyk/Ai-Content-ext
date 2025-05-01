import { Module } from '@nestjs/common';
import { AiContentService } from './ai_content.service';
import { AiContentController } from './ai_content.controller';

@Module({
  providers: [AiContentService],
  controllers: [AiContentController],
})
export class AiContentModule {}
