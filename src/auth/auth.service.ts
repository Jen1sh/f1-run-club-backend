import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { formatErrorResponse } from '../common/helpers/error-formatter.helper';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

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

    return {
      message: 'Login successful',
      user: userWithoutPassword,
    };
  }
}
