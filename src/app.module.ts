import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { NotificationModule } from './modules/notification/notification.module';
import { ConfigModule } from '@nestjs/config';
import { ChatsModule } from './modules/chats/chats.module';
import { jwtModule } from './configs/modules.config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
    }),
    NotificationModule,
    ChatsModule,
    jwtModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
