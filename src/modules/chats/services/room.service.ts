import { Injectable, Logger } from '@nestjs/common';
import { createRoomID } from 'src/common/utils/utils';
import { CreateRoomDto } from '../dtos/room/create-room-dto';
import { JwtService } from '@nestjs/jwt';
import { JoinRoomDto } from '../dtos/room/join-room-dto';
import { RoomRepository } from '../repository/room.repository';
import { AddParticipantData, Room } from '../types';

@Injectable()
export class RoomService {
  private readonly logger = new Logger(RoomService.name);
  constructor(
    private readonly jwtService: JwtService,
    private readonly roomRepository: RoomRepository,
  ) {}

  async createRoom(createRoomDto: CreateRoomDto) {
    const roomId = createRoomID();

    const createdRoom = await this.roomRepository.createRoom({
      ...createRoomDto,
      roomId,
    });

    // this.logger.debug(
    //   `Creating token stirng for notificationID: ${createdRoom.notificationId} and userID: ${createRoomDto.name}`,
    // );

    const signedString = this.jwtService.sign(
      {
        // notificationID: createdNotification.notificationId,
        title: createdRoom.title,
        roomId: createdRoom.id,
        userName: createRoomDto.userName,
      },
      {
        subject: createRoomDto.userId,
      },
    );

    return {
      // notification: createdNotification,
      room: createdRoom,
      accessToken: signedString,
    };
  }

  async joinRoom(joinRoomDto: JoinRoomDto) {
    this.logger.debug(
      `Fetching poll with ID: ${joinRoomDto.roomId} for user with ID: ${joinRoomDto.userId}`,
    );

    const joinedRoom = await this.roomRepository.getRoom(joinRoomDto.roomId);

    this.logger.debug(
      `Creating token string for roomId: ${joinedRoom.id} and userID: ${joinRoomDto.userId}`,
    );

    const signedString = this.jwtService.sign(
      {
        roomId: joinedRoom.id,
        title: joinedRoom.title,
        userName: joinRoomDto.userName,
      },
      {
        subject: joinRoomDto.userId,
      },
    );

    return {
      // poll: joinedPoll,
      room: joinedRoom,
      accessToken: signedString,
    };
  }

  async getRoom(roomId: string) {
    return this.roomRepository.getRoom(roomId);
  }

  async addParticipant(addParticipantData: AddParticipantData): Promise<Room> {
    return this.roomRepository.addParticipant(addParticipantData);
  }

  async removeParticipant(
    roomId: string,
    userId: string,
  ): Promise<Room | void> {
    return this.roomRepository.removeParticipant(roomId, userId);
  }
}
