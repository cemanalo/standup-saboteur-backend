import {
  Body,
  Controller,
  Inject,
  Post,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import {
  AUTH_REPOSITORY,
  Payload,
  type AuthRepository,
} from './auth.repository';
import { type LoginDto } from './auth.dto';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepository,
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const { name, pin, gameId } = loginDto;
    if (!name || !pin || !gameId) {
      throw new Error('Name, pin, and gameId are required');
    }
    return await this.authRepository.signin(name, pin, gameId);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req: { user: Payload }) {
    return req.user;
  }
}
