import {
  Logger,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Namespace } from 'socket.io';
import { RoomService } from './services/room.service';
import { SocketWithAuth } from './types';
import { WsCatchAllFilter } from './exceptions/ws-catch-all-filter';
import { GatewayAdminGuard } from 'src/common/guards/gateway-admin.guard';

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

  async handleConnection(client: SocketWithAuth, ...args: any[]) {
    const sockets = this.io.sockets;

    this.logger.debug(
      `Socket connected with userID: ${client.userId} and name: ${client.username}`,
    );

    this.logger.log(`WS Client with id: ${client.id} connected!`);
    this.logger.log(`Number of connected sockets: ${sockets.size}`);

    // const roomName = client.username;
    // await client.join(roomName);

    // const connectedClients = this.io.adapter.rooms?.get(roomName)?.size ?? 0;

    // this.logger.debug(`UserId: ${client.userId} joined room: ${roomName}`);
    // this.logger.debug(
    //   `Total connected clients in room ${roomName}: ${connectedClients}`,
    // );

    // const updatedRoom = await this.roomService.addParticipant({
    //   userId: client.userId,
    //   userName: client.username,
    //   roomId: client.roomId,
    // });

    // this.io.to(roomName).emit('room_updated', updatedRoom);
  }
  async handleDisconnect(client: SocketWithAuth) {
    const sockets = this.io.sockets;

    this.logger.debug(
      `Socket connected with userID: ${client.userId} and name: ${client.username}`,
    );

    // const { userId, roomId } = client;
    // const updatedRoom = await this.roomService.removeParticipant(
    //   roomId,
    //   userId,
    // );

    // const roomName = client.roomId;
    // const clientCount = this.io.adapter.rooms?.get(roomName)?.size ?? 0;

    this.logger.log(`Disconnected socket id: ${client.id}`);
    this.logger.log(`Number of connected sockets: ${sockets.size}`);
    // this.logger.debug(
    //   `Total connected clients in room ${roomName}: ${clientCount}`,
    // );

    // if (updatedRoom) {
    //   this.io.to(roomName).emit('room_updated', updatedRoom);
    // }
  }

  @UseGuards(GatewayAdminGuard)
  @SubscribeMessage('remove_participants')
  async removeParticipant(
    @MessageBody('id') id: string,
    @ConnectedSocket() client: SocketWithAuth,
  ) {
    this.logger.debug(
      `Attempting to remove participants ${id} from room ${client.roomId}`,
    );

    const updatedRoom = await this.roomService.removeParticipant(
      client.roomId,
      id,
    );

    if (updatedRoom) {
      this.io.to(client.roomId).emit('room_updated', updatedRoom);
    }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: SocketWithAuth, roomId: string) {
    this.logger.debug(`${client.id} joining room: ${roomId}`);
    client.join(roomId); // Client joins the specified room
    client.emit('joinedRoom', `Joined room: ${roomId}`); // Emit a confirmation back to the client
  }

  emitToChannel(roomId: string, channelKey: string, message: any) {
    this.io.in(roomId).emit(channelKey, message); // Use this to emit to specific channels
    this.logger.debug(`Emitting message to channel: ${channelKey}`);
  }

  // @SubscribeMessage('message')
  // handleMessage(@MessageBody() message: string): void {
  //   this.server.emit('message', {
  //     msg: 'New Message',
  //     content: message,
  //   });
  // }
}
