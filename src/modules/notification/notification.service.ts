import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateNotificationFields } from './types';
import { createNotificationID } from 'src/common/utils/utils';
import { NotificationRepository } from './notification.repository';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  constructor(
    private readonly jwtService: JwtService,
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async createNotification(fields: CreateNotificationFields) {
    const notificationId = createNotificationID();

    const createdNotification =
      await this.notificationRepository.createNotification({
        ...fields,
        notificationId,
      });

    this.logger.debug(
      `Creating token stirng for notificationID: ${createdNotification.notificationId} and userID: ${fields.userId}`,
    );

    const signedString = this.jwtService.sign(
      {
        notificationID: createdNotification.notificationId,
        name: fields.title,
      },
      {
        subject: fields.userId,
      },
    );

    return {
      notification: createdNotification,
      accessToken: signedString,
    };
  }
}
