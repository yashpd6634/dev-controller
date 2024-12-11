import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { NotificationModule } from './notification/notification.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
    }),
    GraphQLModule.forRootAsync({
      imports: [],
      inject: [],
      driver: ApolloDriver,
      useFactory: async () => {
        playground: true;
        return {
          autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
          sortSchema: true,
          subscriptions: {},
        };
      },
    }),
    NotificationModule,     
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
