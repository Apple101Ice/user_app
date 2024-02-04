import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Contacts } from './contact.entity';
import { JwtService } from '@nestjs/jwt';

const pageSize = 2;

@Injectable()
export class ContactsService {
    constructor (
        @InjectRepository(Contacts)
        private contactsRepository: Repository<Contacts>,
        private jwtService: JwtService,
    ) { }

    async findAllByUserId (token: string, page: number): Promise<Contacts[]> {        
        const decoded = this.jwtService.verify(token);

        if (!decoded.username)
        {
            throw new UnauthorizedException('Unauthorized');
        }

        const skip = (page - 1) * pageSize;

        const contacts = await this.contactsRepository.find({
            where: { user: { user_id: decoded.userId } },
            relations: ['user'],
            skip,
            take: pageSize,
        });

        return contacts;
    }

    async findAllByPhone (token: string, phone: string, page: number): Promise<Contacts[]> {
        const decoded = this.jwtService.verify(token);

        if (!decoded.username)
        {
            throw new UnauthorizedException('Invalid user');
        }

        const userId = decoded.userId;

        const skip = (page - 1) * pageSize;

        const contacts = await this.contactsRepository.find({
            where: { user: { user_id: userId }, phone:ILike(`%${phone}%`) },
            relations: ['user'],
            skip,
            take: pageSize,
        });

        return contacts;
    }

    async findAllByName (token: string, name: string, page: number): Promise<Contacts[]> {
        const decoded = this.jwtService.verify(token);

        if (!decoded.username)
        {
            throw new UnauthorizedException('Invalid user');
        }

        const userId = decoded.userId;

        const skip = (page - 1) * pageSize;

        const contacts = await this.contactsRepository.find({
            where: { user: { user_id: userId }, name: ILike(`%${name}%`) },
            relations: ['user'],
            skip,
            take: pageSize,
        });

        return contacts;
    }

    async addContact (newContactData: Partial<Contacts>, token: string): Promise<Contacts> {
        const decoded = this.jwtService.verify(token);

        if (!decoded.username)
        {
            throw new UnauthorizedException('Invalid user');
        }

        const userId = decoded.userId;

        if (!userId)
        {
            throw new NotFoundException(`User with ID ${ userId } not found`);
        }

        const newContact = this.contactsRepository.create({
            ...newContactData,
            user: userId,
        });

        await this.contactsRepository.save(newContact);

        return newContact;
    }
}
