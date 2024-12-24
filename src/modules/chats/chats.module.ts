import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatsController } from './chats.controller';
import { RoomService } from './services/room.service';
import { ChatsGateway } from './chats.gateway';
import { jwtModule, redisModule } from 'src/configs/modules.config';
import { RoomRepository } from './repository/room.repository';
import { NotificationService } from '../notification/notification.service';
import { NotificationRepository } from '../notification/notification.repository';

@Module({
  imports: [ConfigModule, redisModule, jwtModule],
  controllers: [ChatsController],
  providers: [
    RoomService,
    ChatsGateway,
    RoomRepository,
    NotificationService,
    NotificationRepository,
  ],
})
export class ChatsModule {}
