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
              email: `${newuser.email}`,
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

      async loginUser(email: string, password: string): Promise<any> {
        this.logger.log(`POST: auth/login: Login iniciado: ${email}`);
        let user;
        try {
          user = await this.prisma.user.findUniqueOrThrow({
            where: {
              email
            },
            select: {
              id: true,
              name: true,
              email: true,
              password: true,
              createdAt: true,
            }
          });
    
        } catch (error) {
          this.logger.error(`POST: auth/login: error: ${error}`);
          throw new BadRequestException('Wrong credentials');
        }
    
        // Compare the provided password with the hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);
    
        if (!passwordMatch) {
          throw new BadRequestException('Wrong credentials');
        }
        
        delete user.password;
        
        this.logger.log(`POST: auth/login: Usuário logado com sucesso: ${user.email}`);
        return {
          user,
          token: this.getJwtToken({
            email: user.email,
  
          })
        };
      }

      private getJwtToken(payload: JwtPayload) {

        const token = this.jwtService.sign(payload);
        return token;
    
      }

      verifyToken(token: string) {
        return this.jwtService.verify(token);
      }

      getPrivacyPolicy(): string {
        return "Ao utilizar a plataforma, você consente com o envio e armazenamento temporário dos vídeos enviados para fins de processamento. Os vídeos originais serão armazenados de forma segura em nossos servidores por um período limitado, sendo excluídos após a conclusão do processamento ou em até 14 dias. As miniaturas geradas a partir dos vídeos serão disponibilizadas para download em formato ZIP, armazenadas por conveniência do cliente. Esses arquivos estarão disponíveis por um prazo de 60 dias e serão excluídos automaticamente após esse período. Nosso sistema utiliza criptografia para proteger seus dados e garante a exclusão definitiva de arquivos expirados. Caso tenha dúvidas ou deseje exercer seus direitos sob a LGPD, entre em contato conosco."
      }
}
