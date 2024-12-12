import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dtos/create-notification-dto';
import { ControllerAuthGuard } from 'src/common/guards/auth.guard';
import { RequestWithAuth } from './types';

@Controller('notifications')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @UseGuards(ControllerAuthGuard)
  @Get()
  async get(@Req() request: RequestWithAuth) {
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
