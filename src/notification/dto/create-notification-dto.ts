import { Type } from 'class-transformer';
import { IsDate, IsString, Length } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @Length(5, 10, { message: 'UserId must be provided' })
  public readonly userId: string;

  @IsString()
  @Length(4, 50, { message: 'Title must be between 5 and 50 characters' })
  public readonly title: string;

  @IsString()
  @Length(5, 100, {
    message: "Notification's body must be between 5 and 100 characters",
  })
  public readonly body: string;

//   @IsDate({ message: 'Invalid Date Format' })
//   @Type(() => Date)
//   public readonly createdAt: Date;
}
