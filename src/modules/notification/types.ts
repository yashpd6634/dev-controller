import { Request } from 'express';
import { Socket } from 'socket.io';

export type AuthPayload = {
  userId: string;
  notificationId: string;
  username: string;
  name: string;
  title: string;
  email: string;
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
};

export type RequestWithNotificationAuth = Request & AuthPayload;
export type SocketWithAuth = Socket & AuthPayload;
