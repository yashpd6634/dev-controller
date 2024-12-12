import { Body, Controller, Logger, Post } from '@nestjs/common';
import { RoomService } from './services/room.service';
import { CreateRoomDto } from './dtos/room/create-room-dto';
import { JoinRoomDto } from './dtos/room/join-room-dto';

@Controller('chats')
export class ChatsController {
  constructor(private roomService: RoomService) {}
  @Post()
  async create(@Body() createRoomDto: CreateRoomDto) {
    const result = await this.roomService.createRoom('xyz', createRoomDto);
    Logger.log('In Create!');
    return result;
  }

  @Post('/join')
  async join(@Body() joinRoomDto: JoinRoomDto) {
    const result = await this.roomService.joinRoom('xyz', joinRoomDto);
    Logger.log('In Join!');

    return result;
  }
}
