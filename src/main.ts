import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['https://ai-content-ext-client.vercel.app'],
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
