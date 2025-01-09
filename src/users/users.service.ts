import { BadRequestException, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { User } from 'src/core/entities/user.entity';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
    private readonly logger = new Logger('UserService');
    constructor(private readonly prisma: PrismaService) {}

    async create(dto: CreateUserDto) {  
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
    
          return newuser;
          
        } catch (error) {
          this.prismaErrorHandler(error, "POST", dto.email);
          this.logger.error(`POST: error: ${error}`);
          throw new InternalServerErrorException('Server error');
        }
      }

    async findOne(username: string): Promise<User> {
      try {
        const user = await this.prisma.user.findUniqueOrThrow({
            where: {
                email: username
            }
        });
        return user;
      } catch (error) {
        this.prismaErrorHandler(error, "GET", username);
        this.logger.error(`GET/{id}: error: ${error}`);
        throw new InternalServerErrorException('Server error');
      }
  }

    prismaErrorHandler = (error: any, method: string, value: string = null) => { 
        if (error.code === 'P2002') {
          this.logger.warn(`${method}: User already exists: ${value}`);
          throw new BadRequestException('User already exists');
        }
        if (error.code === 'P2025') {
          this.logger.warn(`${method}: User not found: ${value}`);
          throw new BadRequestException('User not found');
        }
       }
}
