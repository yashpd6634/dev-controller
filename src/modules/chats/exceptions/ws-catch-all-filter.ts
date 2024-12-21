import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
} from '@nestjs/common';
import { SocketWithAuth as SocketWithNotificationAuth } from 'src/modules/notification/types';
import { SocketWithAuth as SocketWithChatAuth } from 'src/modules/chats/types';
import { WsBadRequestException, WsUnknownException } from './ws-exceptions';

type SocketWithAuth = SocketWithNotificationAuth | SocketWithChatAuth;

@Catch()
export class WsCatchAllFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const socket: SocketWithAuth = host.switchToWs().getClient();

    if (exception instanceof BadRequestException) {
      const exceptionData = exception.getResponse();

      const WsException = new WsBadRequestException(
        exceptionData['message'] ?? 'Bad Request',
      );

      socket.emit('exception', WsException.getError());
      return;
    }

    const WsException = new WsUnknownException(exception.message);
    socket.emit('exception', WsException.getError());
  }
}
