import { Controller, Get, Param } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { User } from "src/core/entities/user.entity";
import { UsersService } from "./users.service";

@ApiBearerAuth()
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  
@Get('email/:email')
@ApiOperation({
  summary: 'GET USER BY EMAIL',
  description: 'Private endpoint to get user data by Email. <ul><li>The "user" role is permitted to access only their own information.</li><li>The "admin" role has the privilege to access information of any user</li></ul>'
})
@ApiResponse({status: 200, description: 'Ok', type: User})
@ApiResponse({status: 401, description: 'Unauthorized'})
@ApiResponse({status: 500, description: 'Server error'})             //Swagger

findOneByEmail(@Param('email') email: string) {
  return this.usersService.findOne(email);
}
}