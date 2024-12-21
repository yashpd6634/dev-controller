import {
  Body,
  Controller,
  Logger,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { RoomService } from './services/room.service';
import { CreateRoomDto } from './dtos/room/create-room-dto';
import { JoinRoomDto } from './dtos/room/join-room-dto';
import { ControllerAuthGuard } from 'src/common/guards/auth.guard';

@UsePipes(new ValidationPipe())
@Controller('chats')
export class ChatsController {
  constructor(private roomService: RoomService) {}
  @Post()
  async create(@Body() createRoomDto: CreateRoomDto) {
    const result = await this.roomService.createRoom(createRoomDto);
    Logger.log('In Create!');
    return result;
  }

  // @UseGuards(ControllerAuthGuard)
  @Post('/join')
  async join(@Body() joinRoomDto: JoinRoomDto) {
    const result = await this.roomService.joinRoom(joinRoomDto);
    Logger.log('In Join!');

    return result;
  }
}
