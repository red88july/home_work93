import {
  Body, ConflictException,
  Controller,
  Post, Res,
  UnprocessableEntityException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../schemas/users.schema';
import mongoose, {Model, mongo} from 'mongoose';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { CreateUserDto } from './create-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import {Response} from "express";

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
        avatar: file ? '/uploads/avatars/' + file.filename : null,
      });

      user.generatedToken();
      await user.save();

      return {message: 'User create successfully!', user};
    } catch (e) {
      if (e instanceof mongoose.Error.ValidationError) {
        throw new UnprocessableEntityException(e)
      }
     throw e;
    }
  }
}
