import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { User } from "src/core/entities/user.entity";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "src/auth/guards/auth.guard";

@ApiBearerAuth()
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  
  @Get('email/:email')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'GET USER BY EMAIL',
    description: 'Private endpoint to get user data by Email.'
  })
  @ApiResponse({status: 200, description: 'Ok', type: User})
  @ApiResponse({status: 401, description: 'Unauthorized'})
  @ApiResponse({status: 500, description: 'Server error'})             //Swagger
  findOneByEmail(@Param('email') email: string) {
    return this.usersService.findOne(email);
  }

  @Get('videos/:email')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'GET USER VIDEOS BY EMAIL',
    description: 'Private endpoint to get user videos by Email.'
  })
  @ApiResponse({status: 200, description: 'Ok', type: User})
  @ApiResponse({status: 401, description: 'Unauthorized'})
  @ApiResponse({status: 500, description: 'Server error'})             //Swagger
  findVideosByEmail(@Param('email') email: string) {
    return this.usersService.findUserUploads(email);
  }
}