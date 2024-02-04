import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, Req, UnauthorizedException, Query, ParseIntPipe } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { Contacts } from './contact.entity';
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard';
import { Request } from 'express';
import { IncomingHttpHeaders } from 'http';

@Controller('contacts')
@UseGuards(JwtAuthGuard)
export class ContactsController {
    constructor (private readonly contactsService: ContactsService) { }

    @Get()
    findAll (
        @Req() request: Request,
        @Query('name') name?: string,
        @Query('phone') phone?: string,
    ): Promise<Contacts[]> {
        const token = this.extractTokenFromRequest(request.headers);
        const page: number = parseInt(request.query.page as string, 10) || 1;

        if (name)
        {
            return this.contactsService.findAllByName(token, name, page);
        } else if (phone)
        {
            return this.contactsService.findAllByPhone(token, phone, page);
        } else
        {
            return this.contactsService.findAllByUserId(token, page);
        }
    }

    @Post('add')
    addContact (@Body() newContactData: Partial<Contacts>, @Req() request: Request): Promise<Contacts> {
        const token = this.extractTokenFromRequest(request.headers);
        return this.contactsService.addContact(newContactData, token);
    }

    private extractTokenFromRequest (headers: IncomingHttpHeaders): string {
        const authorizationHeader = headers.authorization;
        if (authorizationHeader)
        {
            return authorizationHeader.split(' ')[1];
        }

        throw new UnauthorizedException('Token not provided');
    }
}
