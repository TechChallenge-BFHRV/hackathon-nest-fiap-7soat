import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

import { JwtPayload } from "../interfaces/jwt-payload.interface";

import { PrismaService } from "src/prisma/prisma.service";
import { User } from "src/core/entities/user.entity";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private prisma: PrismaService,
    ) {
        super({
            secretOrKey: process.env.JWT_SECRET,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        });
    }

    async validate(payload: JwtPayload): Promise<User> {
        const { email } = payload;
        try {
            const user = await this.prisma.user.findUniqueOrThrow({
                where: {email: email},
                select: {
                    id: true,
                    name: true,
                    email: true,
                    createdAt: true,
                    role: true,
                }
            });
            return user;
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }
}