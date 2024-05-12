import { Controller, Post, Body, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { FastifyRequest, FastifyReply } from 'fastify';

@Controller('/api/v3/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(
    @Res({ passthrough: true }) response: FastifyReply,
    @Body()
    body: { email: string; password: string; name: string; lastname: string },
  ) {
    return this.authService.signup(body, response);
  }
  @Post('signin')
  signin(
    @Res({ passthrough: true }) response: FastifyReply,
    @Body() body: { email: string; password: string },
  ) {
    return this.authService.signin(body, response);
  }
  @Post('refresh')
  refresh(
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) response: FastifyReply,
    @Body() body: { refreshToken?: string },
  ) {
    return this.authService.refresh(body, request, response);
  }
  @Post('signinSSO')
  signinSSO(
    @Res({ passthrough: true }) response: FastifyReply,
    @Body() body: { SSOToken: string },
  ) {
    return this.authService.signinSSO(body, response);
  }
  @Post('verify')
  verify(
    @Res({ passthrough: true }) response: FastifyReply,
    @Body() body: { accessToken: string },
  ) {
    return this.authService.verify(body, response);
  }
  @Post('logout')
  logout(
    @Res({ passthrough: true }) response: FastifyReply,
    @Body() body: { accessToken: string },
  ) {
    return this.authService.logout(body, response);
  }
}
