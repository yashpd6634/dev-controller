import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationResolver } from './notification.resolver';
import { jwtModule, redisModule } from 'src/modules.config';
import { ConfigModule } from '@nestjs/config';
import { NotificationsGateway } from './notification.gateway';

@Module({
  imports: [ConfigModule, redisModule, jwtModule],
  providers: [NotificationService, NotificationResolver, NotificationsGateway],
})
export class NotificationModule {}
