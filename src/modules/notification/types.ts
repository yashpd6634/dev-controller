import { Request } from 'express';
import { Socket } from 'socket.io';

type AuthPayload = {
  userId: string;
  notificationId: string;
  name: string;
};

// service types
export type CreateNotificationFields = {
  userId: string;
  title: string;
  body: string;
  // createdAt: Date;
};

//repository types
export type CreateNotificationData = {
  notificationId: string;
  title: string;
  body: string;
  userId: string;
}

export type RequestWithAuth = Request & AuthPayload;
export type SocketWithAuth = Socket & AuthPayload;
