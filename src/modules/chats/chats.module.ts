import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatsController } from './chats.controller';
import { RoomService } from './services/room.service';
import { ChatsGateway } from './chats.gateway';
import { jwtModule, redisModule } from 'src/configs/modules.config';
import { RoomRepository } from './repository/room.repository';
import { NotificationService } from '../notification/notification.service';
import { NotificationRepository } from '../notification/notification.repository';
import { MessageService } from './services/message.service';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Module({
  imports: [ConfigModule, redisModule, jwtModule],
  controllers: [ChatsController],
  providers: [
    RoomService,
    MessageService,
    ChatsGateway,
    RoomRepository,
    NotificationService,
    NotificationRepository,
    PrismaService,
  ],
})
export class ChatsModule {}
