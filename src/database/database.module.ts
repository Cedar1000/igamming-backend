import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow('DB_HOST'),
        port: configService.getOrThrow('DB_PORT'),
        username: configService.getOrThrow('DB_USER'),
        password: configService.getOrThrow('DB_PASSWORD'),
        database: configService.getOrThrow('DB_DB'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: configService.getOrThrow('DB_SYNCHRONIZE'),
        autoLoadEntities: true,

        ssl: {
          rejectUnauthorized: false, // If using self-signed certificates, set this to false
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
