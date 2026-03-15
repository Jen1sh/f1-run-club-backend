import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { formatErrorResponse } from '../common/helpers/error-formatter.helper';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltRounds,
    );

    const newUser: CreateUserDto = {
      ...createUserDto,
      password: hashedPassword,
      role: 'User',
    };

    return this.userService.create(newUser);
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException(
        formatErrorResponse(
          { email: 'Invalid credentials' },
          'Unauthorized',
          401,
        ),
      );
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        formatErrorResponse(
          { password: 'Invalid credentials' },
          'Unauthorized',
          401,
        ),
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = user.toObject();
    const tokens = await this.generateTokens(
      user._id.toString(),
      user.email,
      user.role,
    );

    return {
      message: 'Login successful',
      user: userWithoutPassword,
      ...tokens,
    };
  }

  async refreshToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      if (payload.tokenType !== 'refresh') {
        throw new UnauthorizedException(
          formatErrorResponse(
            { refreshToken: 'Invalid token type' },
            'Unauthorized',
            401,
          ),
        );
      }

      const user = await this.userService.findByEmail(payload.email);

      if (!user) {
        throw new UnauthorizedException(
          formatErrorResponse(
            { refreshToken: 'User no longer exists' },
            'Unauthorized',
            401,
          ),
        );
      }

      return this.generateTokens(user._id.toString(), user.email, user.role);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException(
        formatErrorResponse(
          { refreshToken: 'Invalid or expired refresh token' },
          'Unauthorized',
          401,
        ),
      );
    }
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, role },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: '1d',
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email, tokenType: 'refresh' },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }
}
