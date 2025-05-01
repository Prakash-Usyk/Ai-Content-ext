import { IsUrl, IsNotEmpty } from 'class-validator';

export class ContentExtractorDto {
  @IsNotEmpty()
  @IsUrl({}, { message: 'Invalid URL format' })
  url: string;
}
