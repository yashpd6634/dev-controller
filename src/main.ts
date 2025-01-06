import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { SocketIOAdapter } from './common/socket/socket-io-adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const clientPortal = configService.get('CLIENT_PORTAL');
  const port = parseInt(configService.get('PORT'));
  app.enableCors({
    origin: [`${clientPortal}`],
    credentials: true,
    allowedHeaders: [
      'Accept',
      'Authorization',
      'Content-Type',
      'X-Requested-With',
      'apollo-require-preflight',
    ],
  });

  app.useWebSocketAdapter(new SocketIOAdapter(app, configService));

  await app.listen(port);
}
bootstrap();
