import {ConflictException,Injectable,NotFoundException,UnauthorizedException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from './users.entity';
import { compare, hash } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class UsersService {
    constructor (
        @InjectRepository(Users)
        private usersRepository: Repository<Users>,
        private jwtService: JwtService,
        private mailService: MailService,
    ) { }

    async login (username: string, password: string,): Promise<{ accessToken: string; }> {
        const user = await this.usersRepository.findOne({ where: { username } });

        if (!user || !(await compare(password, user.password)))
        {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (!user.verified)
        {
            throw new UnauthorizedException('Confirm your email please.');
        }

        const accessToken = this.generateAccessToken(user);

        return { accessToken };
    }

    async myinfo (token: string): Promise<Users> {
        const decoded = this.jwtService.verify(token);

        const user = await this.usersRepository.findOne({
            where: { username: decoded.username },
        });

        if (!user)
        {
            throw new NotFoundException(
                `User Info with name ${ decoded.username } not found`,
            );
        }

        return user;
    }

    async registerUser (newUserData: Partial<Users>): Promise<{ message: string; }> {
        const { username, email, password } = newUserData;

        const existingUser = await this.usersRepository.findOne({
            where: [{ username }, { email }],
        });

        if (existingUser)
        {
            throw new ConflictException('Username or email is already taken');
        }

        const hashedPassword = await hash(password, 10);

        const newUser = this.usersRepository.create({
            username,
            email,
            password: hashedPassword,
            verified: false,
        });

        await this.usersRepository.save(newUser);

        const confirmationLink = `http://localhost:3000/users/confirm/${newUser.email}`;
        await this.mailService.sendConfirmationEmail(
          newUser.email,
          confirmationLink,
        );

        return { message: 'Registered, Check your email for confirmation.' };
    }

    async verifyUser (email: string): Promise<string> {
        const user = await this.usersRepository.findOne({ where: { email: email } });

        if (!user)
        {
            throw new UnauthorizedException('Invalid user');
        }

        if (user.verified)
        {
            return 'Already Verified!';
        }

        user.verified = true;

        await this.usersRepository.save(user);

        return 'Verified!';
    }

    private generateAccessToken (user: Users): string {
        const payload = { username: user.username, userId: user.user_id };
        const secretKey = 'your_secret_key';
        const options = { expiresIn: '1h' };

        return sign(payload, secretKey, options);
    }
}
