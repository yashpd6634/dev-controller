import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatsController } from './chats.controller';
import { RoomService } from './services/room.service';
import { ChatsGateway } from './chats.gateway';
import { jwtModule, redisModule } from 'src/configs/modules.config';
import { RoomRepository } from './repository/room.respository';

@Module({
  imports: [ConfigModule, redisModule, jwtModule],
  controllers: [ChatsController],
  providers: [RoomService, ChatsGateway, RoomRepository],
})
export class ChatsModule {}
