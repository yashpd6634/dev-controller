import { INestApplicationContext, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, ServerOptions } from 'socket.io';
import { SocketWithAuth as SocketWithNotificationAuth } from 'src/modules/notification/types';
import { SocketWithAuth as SocketWithChatAuth } from 'src/modules/chats/types';

export class SocketIOAdapter extends IoAdapter {
  private readonly logger = new Logger(SocketIOAdapter.name);
  constructor(
    private app: INestApplicationContext,
    private configService: ConfigService,
  ) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const clientPortal = this.configService.get('CLIENT_PORTAL');

    const cors = {
      origin: [`${clientPortal}`],
    };

    this.logger.log('Configuration SocketIO server with custom CORS options', {
      cors,
    });

    const optionsWithCORS: ServerOptions = {
      ...options,
      cors,
    };

    const jwtService = this.app.get(JwtService);
    const server: Server = super.createIOServer(port, optionsWithCORS);

    server.of('chats').use(createTokenMiddleware(jwtService, this.logger));

    return server;
  }
}

type SocketWithAuth = SocketWithNotificationAuth | SocketWithChatAuth;

const createTokenMiddleware =
  (jwtService: JwtService, logger: Logger) =>
  (socket: SocketWithAuth, next) => {
    const token =
      socket.handshake.auth.token || socket.handshake.headers['token'];

    logger.debug(`Validationg auth token before connection ${token}`);

    try {
      const payload = jwtService.verify(token);
      socket.userId = payload.sub;
      socket.username = payload.username;
      socket.name = payload.name;
      socket.email = payload.email;
      next();
    } catch (error) {
      next(new Error('FORBIDDEN'));
    }
  };
