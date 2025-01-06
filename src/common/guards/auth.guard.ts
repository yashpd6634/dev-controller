import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RequestWithNotificationAuth } from 'src/modules/notification/types';

@Injectable()
export class ControllerAuthGuard implements CanActivate {
  private readonly logger = new Logger(ControllerAuthGuard.name);
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request: RequestWithNotificationAuth = context
      .switchToHttp()
      .getRequest();

    this.logger.debug(
      'Checking for auth token on request',
      request.headers.authorization,
    );

    const authToken = request.headers.authorization?.replace('Bearer ', '');
    this.logger.log(`Authorization: ${authToken}`);

    try {
      const payload = this.jwtService.verify(authToken);
      this.logger.log(`Payload: ${payload}`);
      request.userId = payload.sub;
      request.name = payload.name;
      request.username = payload.username;
      request.email = payload.email;
      return true;
    } catch (error) {
      throw new ForbiddenException('Invalid authrization token');
    }
  }
}
