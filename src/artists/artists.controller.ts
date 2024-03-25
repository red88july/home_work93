import {
  Body, Controller, Delete,
  Get, NotFoundException, Param,
  Post, UnprocessableEntityException,
  UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Artist, ArtistDocument } from '../schemas/artist.schema';
import mongoose, { Model } from 'mongoose';
import { CreateArtistDto } from './create-artist.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { RolesGuards } from '../auth/role.guard';
import { Role } from '../enums/role.enum';
import { Roles } from '../auth/roles.decorator';

const storage = diskStorage({
  destination: './public/uploads/artists',
  filename: (_req, file, cb) => {
    const name = file.originalname.split('.')[0];
    const extension = extname(file.originalname);
    const randomName = randomUUID();
    cb(null, `${name}-${randomName}${extension}`);
  },
});

@Controller('artists')
export class ArtistsController {
  constructor(
    @InjectModel(Artist.name) private artistModel: Model<ArtistDocument>,
  ) {}

  @Roles(Role.USER)
  @UseGuards(TokenAuthGuard, RolesGuards)
  @Post()
  @UseInterceptors(FileInterceptor('photo', { storage }))
  async postArtist(
    @UploadedFile() file: Express.Multer.File,
    @Body() artistDto: CreateArtistDto,
  ) {
    try {
      const artist = new this.artistModel({
        author: artistDto.author,
        info: artistDto.info,
        photo: file ? '/uploads/artists/' + file.filename : null,
      });

      await artist.save();

      return { message: 'Artists successfully created!', artist };
    } catch (e) {
      if (e instanceof mongoose.Error.ValidationError) {
        throw new UnprocessableEntityException(e);
      }
      throw e;
    }
  }

  @Get()
  async getAll() {
    const getAllArtist = await this.artistModel.find();
    if (getAllArtist.length === 0) {
      throw new UnprocessableEntityException(`Artists not found!`);
    }

    return { message: `All artist is successfully GET!`, getAllArtist };
  }

  @Get(':id')
  async getOneArtist(@Param('id') id: string) {
    const getOneArtist = await this.artistModel.findById(id);
    if (!getOneArtist) {
      throw new NotFoundException(`Artist with id: ${id} not found`);
    }

    return { message: `Artist with id ${id} found`, getOneArtist };
  }

  @Roles(Role.ADMIN)
  @UseGuards(TokenAuthGuard, RolesGuards)
  @Delete(':id')
  async getByIdAndDelete(@Param('id') id: string) {
    const artist = await this.artistModel.findById(id);

    if (!artist) {
      throw new NotFoundException(`Artist with id: ${id} not found`);
    }

    const deletedArtist = await this.artistModel.findByIdAndDelete(id);
    return { message: `Artist with id ${id} was been deleted`, deletedArtist };
  }
}