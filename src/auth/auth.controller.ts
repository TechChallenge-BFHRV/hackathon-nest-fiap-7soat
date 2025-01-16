import { Body, Controller, HttpStatus, Post, Res, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginResponse } from '../core/interfaces/login.response';
import { LoginUserDto } from './dto/login-user.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }
    
    @Post('register')
    @ApiOperation({
        summary: 'REGISTER',
        description: 'Public endpoint to register a new user with "user" Role.'
    })
    @ApiResponse({status: 201, description: 'Ok', type: LoginResponse})          
    @ApiResponse({status: 400, description: 'Bad request'})
    @ApiResponse({status: 500, description: 'Server error'})             //Swagger
    register(@Body() createUserDto: RegisterUserDto) {
        return this.authService.registerUser(createUserDto);
    }

    @Post('login')
    @ApiOperation({
      summary: 'LOGIN',
      description: 'Public endpoint to login and get the Access Token'
    })
    @ApiResponse({status: 200, description: 'Ok', type: LoginResponse})
    @ApiResponse({status: 400, description: 'Bad request'})     
    @ApiResponse({status: 500, description: 'Server error'})             //Swagger
    async login(@Res() response, @Body() loginUserDto: LoginUserDto) {
      const data = await this.authService.loginUser(loginUserDto.email, loginUserDto.password);
      response.status(HttpStatus.OK).send(data);
    }


    @Get('privacy-policy')
    getPrivacyPolicyLGPD(): string {
      return this.authService.getPrivacyPolicy();
    }
}
