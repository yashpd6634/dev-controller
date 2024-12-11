import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { IORedisKey } from 'src/redis.module';
import { CreateNotificationData, CreateNotificationFields } from './types';

@Injectable()
export class NotificationRepository {
  private readonly ttl: string;
  private readonly logger = new Logger(NotificationRepository.name);

  constructor(
    configService: ConfigService,
    @Inject(IORedisKey) private readonly redisClient: Redis,
  ) {
    this.ttl = configService.get('NOTIFICATION_DURATION');
  }

  async createNotification({
    userId,
    title,
    body,
    notificationId,
  }: CreateNotificationData): Promise<CreateNotificationData> {
    const initialNotificationData = {
      userId,
      title,
      body,
      notificationId,
    };

    this.logger.log(
      `Creating new notification: ${JSON.stringify(initialNotificationData, null, 2)} with TTL ${this.ttl}`,
    );

    const key = `notifications:${notificationId}`;

    try {
      await this.redisClient
        .multi([
          ['call','JSON.SET', key, '.', JSON.stringify(initialNotificationData)],
          ['expire', key, Number(this.ttl)],
        ])
        .exec();

      return initialNotificationData;
    } catch (error) {
      this.logger.error(
        `Failed to add notification ${JSON.stringify(initialNotificationData)}\n${error}`,
      );
      throw new InternalServerErrorException();
    }
  }

  async getNotification(
    notificationId: string,
  ): Promise<CreateNotificationData> {
    this.logger.log(`Attempting to get notification with: ${notificationId}`);

    const key = `notifications:${notificationId}`;

    try {
      const currentNotification = (await this.redisClient.call(
        'JSON.GET',
        key,
        '.',
      )) as string;

      this.logger.verbose(currentNotification);

      return JSON.parse(currentNotification);
    } catch (e) {
      this.logger.error(`Failed to get NotificationID ${notificationId}`);
      throw e;
    }
  }
}
