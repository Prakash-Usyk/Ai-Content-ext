import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AiContentController } from './ai_content/ai_content.controller';
import { AiContentModule } from './ai_content/ai_content.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    AiContentModule,
    ConfigModule.forRoot({
      isGlobal: true, // makes the config available app-wide
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
