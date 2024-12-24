import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { RoomService } from 'src/modules/chats/services/room.service';
import { SocketWithAuth as SocketWithNotificationAuth } from 'src/modules/notification/types';
import { SocketWithAuth as SocketWithChatAuth } from 'src/modules/chats/types';
import { AuthPayload as NotificationAuthPayload } from 'src/modules/notification/types';
import { AuthPayload as ChatAuthPayload } from 'src/modules/chats/types';
import { WsUnauthorizedException } from 'src/modules/chats/exceptions/ws-exceptions';
import { NotificationService } from 'src/modules/notification/notification.service';

type SocketWithAuth = SocketWithNotificationAuth | SocketWithChatAuth;
type AuthPayload = NotificationAuthPayload | ChatAuthPayload;

@Injectable()
export class GatewayAdminGuard implements CanActivate {
  private readonly logger = new Logger(GatewayAdminGuard.name);
  constructor(
    private readonly roomService: RoomService,
    private readonly jwtService: JwtService,
    private readonly notificationService: NotificationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const socket: SocketWithAuth = context.switchToWs().getClient();

    const token =
      socket.handshake.auth.token || socket.handshake.headers['token'];

    if (!token) {
      this.logger.error('No authorization token provided');

      throw new WsUnauthorizedException('No token provided');
    }

    try {
      const payload = this.jwtService.verify<AuthPayload & { sub: string }>(
        token,
      );
      this.logger.debug(`Validating admin using token payload: ${payload}`);

      if ('notificationId' in payload) {
        const { sub, notificationId } = payload;
        const notification =
          await this.notificationService.getNotification(notificationId);

        if (sub !== notification.userId) {
          throw new WsUnauthorizedException('Admin priviliges required');
        }
      }
      if ('roomId' in payload) {
        const { sub, roomId } = payload;
        const room = await this.roomService.getRoom(roomId);

        if (sub !== room.adminId) {
          throw new WsUnauthorizedException('Admin priviliges required');
        }
      }

      return true;
    } catch {
      throw new WsUnauthorizedException('Admin priviliges required');
    }
  }
}
