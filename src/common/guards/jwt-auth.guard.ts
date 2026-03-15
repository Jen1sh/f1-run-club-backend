import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { formatErrorResponse } from '../helpers/error-formatter.helper';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException(
        formatErrorResponse(
          { authorization: 'Access token is required' },
          'Unauthorized',
          401,
        ),
      );
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // Reject refresh tokens used as access tokens
      if (payload.tokenType === 'refresh') {
        throw new UnauthorizedException(
          formatErrorResponse(
            { authorization: 'Invalid token type' },
            'Unauthorized',
            401,
          ),
        );
      }

      request['user'] = payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException(
        formatErrorResponse(
          { authorization: 'Invalid or expired access token' },
          'Unauthorized',
          401,
        ),
      );
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
