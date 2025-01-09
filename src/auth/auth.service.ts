import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterUserDto } from './dto/register-user.dto';
import * as bcrypt from 'bcryptjs';
import { JwtPayload } from 'src/core/interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    private readonly logger = new Logger('AuthService');

    constructor(
        private prisma: PrismaService,
        private readonly jwtService: JwtService

    ) { }

    async registerUser(dto: RegisterUserDto): Promise<any> {
        this.logger.log(`POST: user/register: Register user started`);
        // Check if password and passwordConfirmation match
        if (dto.password !== dto.passwordconf) throw new BadRequestException('Passwords do not match');
    
        //Data to lower case
        dto.email = dto.email.toLowerCase().trim();
        // dto.name = dto.name.toLowerCase();
    
    
        //Hash the password
        const hashedPassword = await bcrypt.hash(dto.password, 10);
    
        try {
          
          const {passwordconf , ...newUserData} = dto
          newUserData.password = hashedPassword;
    
          const newuser = await this.prisma.user.create({
            data: newUserData,
            select: {
              id: true,
              name: true,
              email: true,
              createdAt: true,
            }
          });
    
          return {
            user: newuser,
            token: this.getJwtToken({
              id: `${newuser.id}`,
            })
          };
          
        } catch (error) {
          if (error.code === 'P2002') {
            this.logger.warn(`POST: auth/register: User already exists: ${dto.email}`);
            throw new BadRequestException('User already exists');
          }
          this.logger.error(`POST: auth/register: error: ${error}`);
          throw new InternalServerErrorException('Server error');
        }
    
      }

      private getJwtToken(payload: JwtPayload) {

        const token = this.jwtService.sign(payload);
        return token;
    
      }
}
