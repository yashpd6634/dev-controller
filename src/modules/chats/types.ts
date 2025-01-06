import { Request } from 'express';
import { Socket } from 'socket.io';
import { RoomTypeEnum } from './enum/room-type.enum';

export type AuthPayload = {
  userId: string;
  roomId: string;
  username: string;
  name: string;
  email: string;
};

export type CreateRoomData = {
  roomId: string;
  title: string;
  userId: string;
  type: RoomTypeEnum;
};

export type AddParticipantData = {
  roomId: string;
  userId: string;
  userName: string;
};

export type RemoveParticipantData = {
  roomId: string;
  userId: string;
};

export interface Participants {
  [participantID: string]: string;
}

export interface Room {
  id: string;
  title: string;
  participants: Participants;
  adminId: string;
  roomType: RoomTypeEnum;
}

export type RequestWithChatAuth = Request & AuthPayload;
export type SocketWithAuth = Socket & AuthPayload;
