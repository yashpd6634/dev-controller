import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationResolver } from './notification.resolver';
import { jwtModule, redisModule } from 'src/configs/modules.config';
import { ConfigModule } from '@nestjs/config';
import { NotificationController } from './notification.controller';
import { NotificationRepository } from './notification.repository';

@Module({
  imports: [ConfigModule, redisModule, jwtModule],
  providers: [
    NotificationService,
    NotificationRepository,
    NotificationResolver,
  ],
  controllers: [NotificationController],
})
export class NotificationModule {}
