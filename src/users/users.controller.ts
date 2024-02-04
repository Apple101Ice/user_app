import { Body, Controller, Get, Param, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { Users } from './users.entity';
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard';
import { Public } from 'src/auth/public.decorator';
import { Request } from 'express';
import { IncomingHttpHeaders } from 'http';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor (private readonly usersService: UsersService) { }

    @Public()
    @Post('login')
    async login (@Body() loginData: { username: string; password: string; }): Promise<{ accessToken: string; }> {
        return this.usersService.login(loginData.username, loginData.password);
    }

    @Get('myinfo')
    myinfo (@Req() request: Request): Promise<Users> {
        const token = this.extractTokenFromRequest(request.headers);
        return this.usersService.myinfo(token);
    }

    @Public()
    @Post('register')
    registerUser (@Body() newUserData: Partial<Users>): Promise<{ message: string; }> {
        return this.usersService.registerUser(newUserData);
    }

    @Public()
    @Get('confirm/:email')
    async confirmRegistration (@Param('email') email: string): Promise<string> {
        return this.usersService.verifyUser(email);
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
