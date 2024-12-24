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

    this.logger.debug('Checking for auth token on request body', request.body);

    const { accessToken } = request.body;

    try {
      const payload = this.jwtService.verify(accessToken);
      request.userId = payload.sub;
      if ('notificationId' in request) {
        request.notificationId = payload.notificationId;
      }
      if ('roomId' in request) {
        request.roomId = payload.roomId;
      }
      request.userName = payload.name;
      return true;
    } catch (error) {
      throw new ForbiddenException('Invalid authrization token');
    }

    // const token = this.extractToken(request);

    // if (!token) throw new UnauthorizedException('Not authorized');

    // try {
    //   const payload = await this.jwtService.verifyAsync(token, {
    //     publicKey: process.env.JWT_PUBLIC_KEY,
    //     algorithms: ['RS256'],
    //   });
    //   request['profile'] = payload;
    // } catch (e) {
    //   throw new UnauthorizedException('Not authorized');
    // }

    // return true;
  }

  // private extractToken(request: Request): string | undefined {
  //   return request.headers.authorization?.replace('Bearer', '');
  // }
}
