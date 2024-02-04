import { Contacts } from 'src/contacts/contact.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity()
export class Users {
    @PrimaryGeneratedColumn()
    user_id: number;

    @Column({ unique: true })
    username: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column()
    verified: boolean;

    @OneToMany(() => Contacts, (contact) => contact.user, { cascade: true })
    contacts: Contacts[];
}
