import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatsController } from './chats.controller';
import { RoomService } from './services/room.service';

@Module({
  imports: [ConfigModule],
  controllers: [ChatsController],
  providers: [RoomService],
})
export class ChatsModule {}
