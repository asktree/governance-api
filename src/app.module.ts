import { join } from 'path';

import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { MercuriusDriver, MercuriusDriverConfig } from '@nestjs/mercurius';
import { TypeOrmModule } from '@nestjs/typeorm';

// import { NonceScalar } from '@lib/scalars/Nonce';
import { PublicKeyScalar } from '@lib/scalars/PublicKey';
import { AppController } from '@src/app.controller';
import { AppService } from '@src/app.service';
import { AuthModule } from '@src/auth/auth.module';
import { ConfigModule } from '@src/config/config.module';
import { ConfigService } from '@src/config/config.service';

import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule,
    GraphQLModule.forRoot<MercuriusDriverConfig>({
      autoSchemaFile: true,
      buildSchemaOptions: {
        dateScalarMode: 'timestamp',
      },
      driver: MercuriusDriver,
      resolvers: {
        // Nonce: NonceScalar,
        PublicKey: PublicKeyScalar,
      },
      sortSchema: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        autoLoadEntities: true,
        entities: [join(__dirname, '/**/entity{.ts,.js}')],
        password: configService.get('database.password'),
        ssl: configService.get('database.useSsl') ? { rejectUnauthorized: true } : false,
        url: configService.get('database.url'),
        username: configService.get('database.username'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}