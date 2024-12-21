import { Logger, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Namespace } from 'socket.io';
import { RoomService } from './services/room.service';
import { SocketWithAuth } from './types';
import { WsCatchAllFilter } from './exceptions/ws-catch-all-filter';

@UsePipes(new ValidationPipe())
@UseFilters(new WsCatchAllFilter())
@WebSocketGateway({ namespace: 'chats' })
export class ChatsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(ChatsGateway.name);

  constructor(private readonly roomService: RoomService) {}
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
      `Socket connected with userID: ${client.userId}, roomId: ${client.roomId}, and name: ${client.name}`,
    );

    this.logger.log(`WS Client with id: ${client.id} connected!`);
    this.logger.log(`Number of connected sockets: ${sockets.size}`);

    this.io.emit('hello', `from ${client.id}`);
  }
  handleDisconnect(client: SocketWithAuth) {
    const sockets = this.io.sockets;

    this.logger.debug(
      `Socket connected with userID: ${client.userId}, roomId: ${client.roomId}, and name: ${client.name}`,
    );

    this.logger.log(`Disconnected socket id: ${client.id}`);
    this.logger.log(`Number of connected sockets: ${sockets.size}`);
  }

  // @SubscribeMessage('message')
  // handleMessage(@MessageBody() message: string): void {
  //   this.server.emit('message', {
  //     msg: 'New Message',
  //     content: message,
  //   });
  // }
}
