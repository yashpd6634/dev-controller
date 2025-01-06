import {
  Body,
  Controller,
  Delete,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { RoomService } from './services/room.service';
import { CreateRoomDto } from './dtos/room/create-room-dto';
import { JoinRoomDto } from './dtos/room/join-room-dto';
import { ControllerAuthGuard } from 'src/common/guards/auth.guard';
import { ChatsGateway } from './chats.gateway';
import { MessageService } from './services/message.service';
import { CreateMessageDto } from './dtos/message/create-message-dto';
import { UpdateMessageDto } from './dtos/message/update-message-dto';
import { RoomTypeEnum } from './enum/room-type.enum';

@UseGuards(ControllerAuthGuard)
@UsePipes(new ValidationPipe())
@Controller('chats')
export class ChatsController {
  constructor(
    private roomService: RoomService,
    private readonly messageService: MessageService,
    private readonly chatGateway: ChatsGateway,
  ) {}
  @Post()
  async create(@Body() createRoomDto: CreateRoomDto) {
    const result = await this.roomService.createRoom(createRoomDto);
    Logger.log('In Create!');
    return result;
  }

  @Post('message')
  async createMessage(
    @Query('serverId') serverId: string,
    @Query('channelId') channelId: string,
    @Query('conversationId') conversationId: string,
    @Body() createMessageDto: CreateMessageDto,
    @Req() req: any,
    @Res() res: any,
  ) {
    try {
      const profileId = req.userId;
      let roomType: RoomTypeEnum = RoomTypeEnum.GROUP;

      if (serverId && channelId) {
        roomType = RoomTypeEnum.GROUP;
      } else {
        roomType = RoomTypeEnum.DIRECT;
      }

      const message = await this.messageService.createMessage(
        profileId,
        createMessageDto,
        serverId,
        channelId,
        conversationId,
        roomType,
      );

      if (roomType === RoomTypeEnum.GROUP) {
        const channelKey = `chat:${channelId}:message`;
        this.chatGateway.emitToChannel(channelId, channelKey, message);
      } else if (roomType === RoomTypeEnum.DIRECT) {
        const conversationKey = `chat:${conversationId}:message`;
        this.chatGateway.emitToChannel(
          conversationId,
          conversationKey,
          message,
        );
      }

      return res.status(200).json(message);
    } catch (error) {
      console.error('[CREATE_MESSAGE_ERROR]', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  @Patch('message/:messageId')
  async updateMessage(
    @Param('messageId') messageId: string,
    @Query('serverId') serverId: string,
    @Query('channelId') channelId: string,
    @Query('conversationId') conversationId: string,
    @Body() updateMessageDto: UpdateMessageDto,
    @Req() req: any,
    @Res() res: any,
  ) {
    try {
      const profileId = req.userId;
      let roomType: RoomTypeEnum = RoomTypeEnum.GROUP;

      if (serverId && channelId) {
        roomType = RoomTypeEnum.GROUP;
      } else {
        roomType = RoomTypeEnum.DIRECT;
      }

      const updatedMessage = await this.messageService.updateMessage(
        profileId,
        messageId,
        serverId,
        channelId,
        updateMessageDto,
        conversationId,
        roomType,
      );

      if (roomType === RoomTypeEnum.GROUP) {
        const channelKey = `chat:${channelId}:message:update`;
        this.chatGateway.emitToChannel(channelId, channelKey, updatedMessage);
      } else if (roomType === RoomTypeEnum.DIRECT) {
        const conversationKey = `chat:${conversationId}:message:update`;
        this.chatGateway.emitToChannel(
          conversationId,
          conversationKey,
          updatedMessage,
        );
      }

      return res.status(200).json({
        success: true,
        data: updatedMessage,
      });
    } catch (error) {
      console.error('[CREATE_MESSAGE_ERROR]', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  @Delete('message/:messageId')
  async deleteMessage(
    @Param('messageId') messageId: string,
    @Query('serverId') serverId: string,
    @Query('channelId') channelId: string,
    @Query('conversationId') conversationId: string,
    @Req() req: any,
    @Res() res: any,
  ) {
    try {
      const profileId = req.userId;

      let roomType: RoomTypeEnum = RoomTypeEnum.GROUP;

      if (serverId && channelId) {
        roomType = RoomTypeEnum.GROUP;
      } else {
        roomType = RoomTypeEnum.DIRECT;
      }

      const deletedMessage = await this.messageService.deleteMessage(
        profileId,
        messageId,
        serverId,
        channelId,
        conversationId,
        roomType,
      );

      if (roomType === RoomTypeEnum.GROUP) {
        const channelKey = `chat:${channelId}:message:update`;
        this.chatGateway.emitToChannel(channelId, channelKey, deletedMessage);
      } else if (roomType === RoomTypeEnum.DIRECT) {
        const conversationKey = `chat:${conversationId}:message:update`;
        this.chatGateway.emitToChannel(
          conversationId,
          conversationKey,
          deletedMessage,
        );
      }

      return res.status(200).json(deletedMessage);
    } catch (error) {
      console.error('[CREATE_MESSAGE_ERROR]', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  // @UseGuards(ControllerAuthGuard)
  @Post('/join')
  async join(@Body() joinRoomDto: JoinRoomDto) {
    const result = await this.roomService.joinRoom(joinRoomDto);
    Logger.log('In Join!');

    return result;
  }
}
