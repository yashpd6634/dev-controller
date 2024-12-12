import { Injectable, Logger } from '@nestjs/common';
import { createRoomID } from 'src/common/utils/utils';
import { CreateRoomDto } from '../dtos/room/create-room-dto';
import { JwtService } from '@nestjs/jwt';
import { JoinRoomDto } from '../dtos/room/join-room-dto';

@Injectable()
export class RoomService {
  private readonly logger = new Logger(RoomService.name);
  constructor(
    private readonly jwtService: JwtService,
    // private readonly notificationRepository: NotificationRepository,
  ) {}

  async createRoom(userId: string, createRoomDto: CreateRoomDto) {
    const roomId = createRoomID();

    // const createdRoom = await this.roomRepository.createNotification({
    //   ...createRoomDto,
    //   roomId,
    // });

    // this.logger.debug(
    //   `Creating token stirng for notificationID: ${createdRoom.notificationId} and userID: ${createRoomDto.name}`,
    // );

    const signedString = this.jwtService.sign(
      {
        // notificationID: createdNotification.notificationId,
        name: createRoomDto.name,
      },
      {
        subject: userId,
      },
    );

    return {
      // notification: createdNotification,
      notification: createRoomDto,
      accessToken: signedString,
    };
  }

  async joinRoom(userId: string, createRoomDto: JoinRoomDto) {
    this.logger.debug(
      `Fetching poll with ID: ${createRoomDto.roomId} for user with ID: ${userId}`,
    );

    // const joinedPoll = await this.pollsRepository.getPoll(createRoomDto.roomId);

    this.logger.debug(
      `Creating token string for pollID: ${createRoomDto.roomId} and userID: ${userId}`,
    );

    const signedString = this.jwtService.sign(
      {
        roomId: createRoomDto.roomId,
        // name: createRoomDto.roomId,
      },
      {
        // subject: userId,
      },
    );

    return {
      // poll: joinedPoll,
      poll: createRoomDto,
      accessToken: signedString,
    };
  }
}
