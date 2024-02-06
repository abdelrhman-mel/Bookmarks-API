import { ForbiddenException, Injectable } from "@nestjs/common";
import { User, Bookmark } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from "argon2";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { JwtService } from "@nestjs/jwt";
import { config } from "process";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
    constructor(
        private config: ConfigService,
        private prisma: PrismaService,
        private jwt: JwtService
        ) {}

    async signup(dto: AuthDto) {
        //generate the password hash
        const hash = await argon.hash(dto.password);
        //save the new user to the database
        try {
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    hash,
                    id: dto.id
                },

            });
            return this.signToken(user.id, user.email);

        } catch (err) {
            if(err instanceof PrismaClientKnownRequestError) {
                if(err.code === 'P2002') {
                    throw new ForbiddenException(
                        'Credentials taken',
                    )
                }
            }
        }
    }

    async signin(dto: AuthDto) {
        //find the user by email
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email,
                id: dto.id
            },
        });
        //if user does not exist throw exception
        if(!user) throw new ForbiddenException('Credentials incorrect')
        //compare password
    
        const pwMatches = await argon.verify(user.hash, dto.password);
        //if password is incorrect throw exception
        if(!pwMatches) throw new ForbiddenException('Credentials incorrect')
        //send back the user
        return this.signToken(user.id, user.email);
    }

    async signToken(userId: number, email: string): Promise<{access_token: string}> {
            const payLoad = {
                sub: userId,
                email
            };
            const secret = this.config.get('JWT_SECRET');

            const token =  await this.jwt.signAsync(payLoad, {
                expiresIn: '15m',
                secret: secret,
            })

            return {
                access_token: token,
            };
        }
}
