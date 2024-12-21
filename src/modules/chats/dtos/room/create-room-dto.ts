import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { RoomTypeEnum } from '../../enum/room-type.enum';

export class CreateRoomDto {
  @IsEnum(RoomTypeEnum)
  @Transform(({ value }) => value.toString())
  @IsNotEmpty()
  type: RoomTypeEnum;

  @IsString()
  @IsOptional()
  title: string;

  userId: string;

  // @IsArray()
  // @IsString({ each: true })
  // @IsUUID(undefined, {
  //   each: true,
  //   message: 'Each participant must be a valid UUID',
  // })
  // @IsNotEmpty()
  // participants: string[];
}
