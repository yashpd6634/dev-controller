import { Logger } from '@nestjs/common';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Namespace, Server } from 'socket.io';
import { NotificationService } from './notification.service';
import { SocketWithAuth } from './types';

@WebSocketGateway({ namespace: 'notifications' })
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(private readonly notificationsService: NotificationService) {}
  @WebSocketServer()
  io: Namespace;

  afterInit(): void {
    this.logger.log('WebSocket Gateway initialized');
    // this.server.on('connection', (socket) => {
    //   console.log(socket.id, ' Connected');
    // });
  }

  handleConnection(client: SocketWithAuth, ...args: any[]) {
    const sockets = this.io.sockets;

    this.logger.debug(
      `Socket connected with userID: ${client.userId}, notificationId: ${client.notificationId}, and name: ${client.name}`,
    );

    this.logger.log(`WS Client with id: ${client.id} connected!`);
    this.logger.log(`Number of connected sockets: ${sockets.size}`);

    throw new Error('Method not implemented.');
  }
  handleDisconnect(client: SocketWithAuth) {
    const sockets = this.io.sockets;

    this.logger.debug(
      `Socket connected with userID: ${client.userId}, notificationId: ${client.notificationId}, and name: ${client.name}`,
    );

    this.logger.log(`Disconnected socket id: ${client.id}`);
    this.logger.log(`Number of connected sockets: ${sockets.size}`);

    throw new Error('Method not implemented.');
  }

  // @SubscribeMessage('message')
  // handleMessage(@MessageBody() message: string): void {
  //   this.server.emit('message', {
  //     msg: 'New Message',
  //     content: message,
  //   });
  // }
}
