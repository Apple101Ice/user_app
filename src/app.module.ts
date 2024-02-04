import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './users/users.entity';
import { ContactsController } from './contacts/contacts.controller';
import { ContactsService } from './contacts/contacts.service';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { Contacts } from './contacts/contact.entity';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './auth/jwt.strategy';
import { MailModule } from './mail/mail.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
require('dotenv').config();

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.POSTGRES_HOST,
            port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
            username: process.env.POSTGRES_USERNAME,
            password: process.env.POSTGRES_PASSWORD,
            database: process.env.POSTGRES_DATABASE,
            entities: [Users, Contacts],
            synchronize: true,
        }),
        MailModule,
        TypeOrmModule.forFeature([Users, Contacts]),
        JwtModule.register({
            secret: 'your_secret_key',
            signOptions: { expiresIn: '1h' },
        })
    ],
    controllers: [UsersController, ContactsController, AppController],
    providers: [UsersService, ContactsService, JwtStrategy, AppService],
})
export class AppModule { }
