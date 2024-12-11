import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification-dto';

@Controller('notifications')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get()
  async get() {
    Logger.log('In Get');
  }

  @Post()
  async create(@Body() createNotificationDto: CreateNotificationDto) {
    const result = await this.notificationService.createNotification(
      createNotificationDto,
    );

    return result;
  }
}
