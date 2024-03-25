import {
  Body,
  Controller,
  Delete,
  Post,
  Req,
  UnprocessableEntityException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../schemas/users.schema';
import mongoose, { Model } from 'mongoose';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { CreateUserDto } from './create-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';

const storage = diskStorage({
  destination: './public/uploads/avatars',
  filename: (_req, file, cb) => {
    const name = file.originalname.split('.')[0];
    const extension = extname(file.originalname);
    const randomName = randomUUID();
    cb(null, `${name}-${randomName}${extension}`);
  },
});

@Controller('users')
export class UsersController {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('avatar', { storage }))
  async postUser(
    @UploadedFile() file: Express.Multer.File,
    @Body() usersDto: CreateUserDto,
  ) {
    try {
      const user = new this.userModel({
        email: usersDto.email,
        password: usersDto.password,
        displayName: usersDto.displayName,
        role: usersDto.role,
        avatar: file ? '/uploads/avatars/' + file.filename : null,
      });

      user.generatedToken();
      await user.save();

      return { message: 'User create successfully!', user };
    } catch (e) {
      if (e instanceof mongoose.Error.ValidationError) {
        throw new UnprocessableEntityException(e);
      }
      throw e;
    }
  }

  @UseGuards(AuthGuard('local'))
  @Post('sessions')
  async login(@Req() req: Request) {
    return {
      message: "User authenticate is correct!",
      user: req.user
    };
  }

  @Delete('sessions')
  async logout(@Req() req: Request) {

    try {
      const message = { message: 'Success' };
      const headerValue = req.get('Authorization');

      if (!headerValue) {
        return message;
      }

      const [_bearer, token] = headerValue.split('');

      const user = await this.userModel.findOne({ token });

      if (!user) {
        return message;
      }

      user.generatedToken();
      await user.save();

      return message;
    } catch (e) {
      throw e;
    }
  }
}