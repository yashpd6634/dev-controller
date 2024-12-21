import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { IORedisKey } from 'src/common/redis/redis.module';
import { AddParticipantData, CreateRoomData, Room } from '../types';

@Injectable()
export class RoomRepository {
  private readonly ttl: string;
  private readonly logger = new Logger(RoomRepository.name);

  constructor(
    configService: ConfigService,
    @Inject(IORedisKey) private readonly redisClient: Redis,
  ) {
    this.ttl = configService.get('ROOM_DURATION');
  }

  async createRoom({
    userId,
    title,
    roomId,
    type,
  }: CreateRoomData): Promise<Room> {
    const initialRoomData = {
      adminId: userId,
      id: roomId,
      title,
      participants: {},
      roomType: type,
    };

    this.logger.log(
      `Creating new room: ${JSON.stringify(initialRoomData, null, 2)} with TTL ${this.ttl}`,
    );

    const key = `room:${roomId}`;

    try {
      await this.redisClient
        .multi([
          ['call', 'JSON.SET', key, '.', JSON.stringify(initialRoomData)],
          ['expire', key, Number(this.ttl)],
        ])
        .exec();

      return initialRoomData;
    } catch (error) {
      this.logger.error(
        `Failed to add notification ${JSON.stringify(initialRoomData)}\n${error}`,
      );
      throw new InternalServerErrorException();
    }
  }

  async getRoom(roomId: string): Promise<Room> {
    this.logger.log(`Attempting to get notification with: ${roomId}`);

    const key = `room:${roomId}`;

    try {
      const currentRoom = (await this.redisClient.call(
        'JSON.GET',
        key,
        '.',
      )) as string;

      this.logger.verbose(currentRoom);

      return JSON.parse(currentRoom);
    } catch (e) {
      this.logger.error(`Failed to get RoomID ${roomId}`);
      throw e;
    }
  }

  async addParticipant({
    roomId,
    userId,
    name,
  }: AddParticipantData): Promise<Room> {
    this.logger.log(
      `Attempting to add a participant with userID/name: ${userId}/${name} to pollID: ${roomId}`,
    );

    const key = `room:${roomId}`;
    const participantPath = `.participants.${userId}`;

    try {
      await this.redisClient.call(
        'JSON.SET',
        key,
        participantPath,
        JSON.stringify(name),
      );

      const roomJSON = (await this.redisClient.call(
        'JSON.GET',
        key,
        '.',
      )) as string;

      const room = JSON.parse(roomJSON) as Room;

      this.logger.debug(
        `Current Participants for pollID: ${roomId}:`,
        room.participants,
      );

      return room;
    } catch (e) {
      this.logger.error(
        `Failed to add a participant with userID/name: ${userId}/${name} to pollID: ${roomId}`,
      );
      throw e;
    }
  }
}
