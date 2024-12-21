import { IsArray, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class JoinRoomDto {
  userId: string;

  @IsUUID()
  @IsString()
  @IsNotEmpty()
  roomId: string;

  // @IsArray()
  // @IsString({ each: true })
  // @IsUUID(undefined, { each: true })
  // @IsNotEmpty()
  // participants: string[];
}