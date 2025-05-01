import { Body, Controller, Post } from '@nestjs/common';
import { ContentExtractorDto } from './dto/add.dto';
import { AiContentService } from './ai_content.service';

@Controller('ai-content')
export class AiContentController {
  constructor(private readonly aiContentService: AiContentService) {}
  @Post()
  async ContentExtractor(@Body() payload: ContentExtractorDto): Promise<any> {
    const { url } = payload;
    const result = await this.aiContentService.extractAndSummarize(url);
    return result;
  }
}
