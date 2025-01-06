import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateMessageDto } from '../dtos/message/create-message-dto';
import { UpdateMessageDto } from '../dtos/message/update-message-dto';
import { MemberRole } from '@prisma/client';
import { RoomTypeEnum } from '../enum/room-type.enum';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async createMessage(
    profileId: string,
    createMessageDto: CreateMessageDto,
    serverId: string,
    channelId: string,
    conversationId: string,
    roomType: RoomTypeEnum,
  ) {
    const { content, fileUrl } = createMessageDto;

    if (!content) {
      return new BadRequestException('Content is missing');
    }

    if (!profileId) {
      throw new UnauthorizedException('Unauthorized');
    }

    if (roomType === RoomTypeEnum.GROUP) {
      if (!serverId) {
        return new BadRequestException('ServerId is missing');
      }

      if (!channelId) {
        return new BadRequestException('ChannelId is missing');
      }

      const server = await this.prisma.server.findFirst({
        where: {
          id: serverId as string,
          members: {
            some: {
              userId: profileId,
            },
          },
        },
        include: {
          members: true,
        },
      });

      if (!server) {
        throw new NotFoundException('Server not found');
      }

      const channel = await this.prisma.channel.findFirst({
        where: { id: channelId as string, serverId: serverId as string },
      });

      if (!channel) {
        throw new NotFoundException('Channel not found');
      }

      const member = server.members.find(
        (member) => member.userId === profileId,
      );

      if (!member) {
        throw new NotFoundException('Member not found');
      }

      const message = await this.prisma.message.create({
        data: {
          content,
          fileUrl,
          channelId: channelId as string,
          memberId: member.id,
        },
        include: {
          member: {
            include: { user: true },
          },
        },
      });

      return message;
    } else if (roomType === RoomTypeEnum.DIRECT) {
      if (!conversationId) {
        return new BadRequestException('ConversationId is missing');
      }

      const conversation = await this.prisma.conversation.findFirst({
        where: {
          id: conversationId as string,
          OR: [
            {
              memberOne: {
                userId: profileId,
              },
            },
            {
              memberTwo: {
                userId: profileId,
              },
            },
          ],
        },
        include: {
          memberOne: {
            include: {
              user: true,
            },
          },
          memberTwo: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!conversation) {
        return new NotFoundException('Conversation not found');
      }

      const member =
        conversation.memberOne.userId === profileId
          ? conversation.memberOne
          : conversation.memberTwo;

      if (!member) {
        return new NotFoundException('Member not found');
      }

      const message = await this.prisma.directMessage.create({
        data: {
          content,
          fileUrl,
          conversationId: conversationId as string,
          memberId: member.id,
        },
        include: {
          member: {
            include: {
              user: true,
            },
          },
        },
      });

      return message;
    }
  }

  async updateMessage(
    profileId: string,
    messageId: string,
    serverId: string,
    channelId: string,
    updateMessageDto: UpdateMessageDto,
    conversationId: string,
    roomType: RoomTypeEnum,
  ) {
    const { content, fileUrl } = updateMessageDto;

    if (!profileId) {
      throw new UnauthorizedException('Unauthorized');
    }

    if (roomType === RoomTypeEnum.GROUP) {
      if (!serverId) {
        return new BadRequestException('ServerId is missing');
      }

      if (!channelId) {
        return new BadRequestException('ChannelId is missing');
      }

      const server = await this.prisma.server.findFirst({
        where: {
          id: serverId as string,
          members: {
            some: {
              userId: profileId,
            },
          },
        },
        include: {
          members: true,
        },
      });

      if (!server) {
        throw new NotFoundException('Server not found');
      }

      const channel = await this.prisma.channel.findFirst({
        where: { id: channelId as string, serverId: serverId as string },
      });

      if (!channel) {
        throw new NotFoundException('Channel not found');
      }

      const member = server.members.find(
        (member) => member.userId === profileId,
      );

      if (!member) {
        throw new NotFoundException('Member not found');
      }

      let message = await this.prisma.message.findFirst({
        where: { id: messageId as string, channelId: channelId as string },
        include: {
          member: {
            include: { user: true },
          },
        },
      });

      if (!message || message?.deleted) {
        return new NotFoundException('Message not found');
      }

      const isMessageOwner = message?.memberId === member.id;
      const isAdmin = member.role === MemberRole.ADMIN;
      const isModerator = member.role === MemberRole.MODERATOR;
      const canModify = isMessageOwner || isAdmin || isModerator;

      if (!canModify) {
        throw new UnauthorizedException('Unauthorized');
      }

      if (!isMessageOwner) {
        return new UnauthorizedException('Unauthorized');
      }

      message = await this.prisma.message.update({
        where: { id: messageId as string },
        data: {
          content,
        },
        include: {
          member: {
            include: {
              user: true,
            },
          },
        },
      });

      return message;
    } else if (roomType === RoomTypeEnum.DIRECT) {
      if (!conversationId) {
        return new BadRequestException('ConversationId is missing');
      }

      const conversation = await this.prisma.conversation.findFirst({
        where: {
          id: conversationId as string,
          OR: [
            {
              memberOne: {
                userId: profileId,
              },
            },
            {
              memberTwo: {
                userId: profileId,
              },
            },
          ],
        },
        include: {
          memberOne: {
            include: {
              user: true,
            },
          },
          memberTwo: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!conversation) {
        return new NotFoundException('Conversation not found');
      }

      const member =
        conversation.memberOne.userId === profileId
          ? conversation.memberOne
          : conversation.memberTwo;

      if (!member) {
        return new NotFoundException('Member not found');
      }

      let directMessage = await this.prisma.directMessage.findFirst({
        where: {
          id: messageId as string,
          conversationId: conversationId as string,
        },
        include: {
          member: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!directMessage || directMessage?.deleted) {
        return new NotFoundException('Message not found');
      }

      const isMessageOwner = directMessage?.memberId === member.id;
      const isAdmin = member.role === MemberRole.ADMIN;
      const isModerator = member.role === MemberRole.MODERATOR;
      const canModify = isMessageOwner || isAdmin || isModerator;

      if (!canModify) {
        return new UnauthorizedException('Unauthorized');
      }

      directMessage = await this.prisma.directMessage.update({
        where: {
          id: messageId,
        },
        data: {
          content,
        },
        include: {
          member: {
            include: {
              user: true,
            },
          },
        },
      });

      return directMessage;
    }
  }

  async deleteMessage(
    profileId: string,
    messageId: string,
    serverId: string,
    channelId: string,
    conversationId: string,
    roomType: RoomTypeEnum,
  ) {
    if (!profileId) {
      throw new UnauthorizedException('Unauthorized');
    }

    if (roomType === RoomTypeEnum.GROUP) {
      if (!serverId) {
        return new BadRequestException('ServerId is missing');
      }

      if (!channelId) {
        return new BadRequestException('ChannelId is missing');
      }

      const server = await this.prisma.server.findFirst({
        where: {
          id: serverId as string,
          members: {
            some: {
              userId: profileId,
            },
          },
        },
        include: {
          members: true,
        },
      });

      if (!server) {
        throw new NotFoundException('Server not found');
      }

      const channel = await this.prisma.channel.findFirst({
        where: { id: channelId as string, serverId: serverId as string },
      });

      if (!channel) {
        throw new NotFoundException('Channel not found');
      }

      const member = server.members.find(
        (member) => member.userId === profileId,
      );

      if (!member) {
        throw new NotFoundException('Member not found');
      }

      let message = await this.prisma.message.findFirst({
        where: { id: messageId as string, channelId: channelId as string },
        include: {
          member: {
            include: { user: true },
          },
        },
      });

      if (!message || message?.deleted) {
        return new NotFoundException('Message not found');
      }

      const isMessageOwner = message?.memberId === member.id;
      const isAdmin = member.role === MemberRole.ADMIN;
      const isModerator = member.role === MemberRole.MODERATOR;
      const canModify = isMessageOwner || isAdmin || isModerator;

      if (!canModify) {
        throw new UnauthorizedException('Unauthorized');
      }

      message = await this.prisma.message.update({
        where: {
          id: messageId as string,
        },
        data: {
          fileUrl: null,
          content: 'This message has been deleted',
          deleted: true,
        },
        include: {
          member: {
            include: {
              user: true,
            },
          },
        },
      });

      return message;
    } else if (roomType === RoomTypeEnum.DIRECT) {
      if (!conversationId) {
        return new BadRequestException('ConversationId is missing');
      }

      const conversation = await this.prisma.conversation.findFirst({
        where: {
          id: conversationId as string,
          OR: [
            {
              memberOne: {
                userId: profileId,
              },
            },
            {
              memberTwo: {
                userId: profileId,
              },
            },
          ],
        },
        include: {
          memberOne: {
            include: {
              user: true,
            },
          },
          memberTwo: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!conversation) {
        return new NotFoundException('Conversation not found');
      }

      const member =
        conversation.memberOne.userId === profileId
          ? conversation.memberOne
          : conversation.memberTwo;

      if (!member) {
        return new NotFoundException('Member not found');
      }

      let directMessage = await this.prisma.directMessage.findFirst({
        where: {
          id: messageId as string,
          conversationId: conversationId as string,
        },
        include: {
          member: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!directMessage || directMessage?.deleted) {
        return new NotFoundException('Message not found');
      }

      const isMessageOwner = directMessage?.memberId === member.id;
      const isAdmin = member.role === MemberRole.ADMIN;
      const isModerator = member.role === MemberRole.MODERATOR;
      const canModify = isMessageOwner || isAdmin || isModerator;

      if (!canModify) {
        return new UnauthorizedException('Unauthorized');
      }

      directMessage = await this.prisma.directMessage.update({
        where: {
          id: messageId as string,
        },
        data: {
          fileUrl: null,
          content: 'This message has been deleted',
          deleted: true,
        },
        include: {
          member: {
            include: {
              user: true,
            },
          },
        },
      });

      return directMessage;
    }
  }
}
