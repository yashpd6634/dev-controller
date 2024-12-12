import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class NotificationResolver {
  @Query(() => String)
  async hello() {
    return 'hello world!';
  }
}
