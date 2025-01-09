import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginResponse } from '../core/interfaces/login.response';

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
}
