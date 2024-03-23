import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Req,
  UnprocessableEntityException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Album, AlbumDocument } from '../schemas/album.schema';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { CreateAlbumDto } from './create-album.dto';

const storage = diskStorage({
  destination: './public/uploads/albums',
  filename: (_req, file, cb) => {
    const name = file.originalname.split('.')[0];
    const extension = extname(file.originalname);
    const randomName = randomUUID();
    cb(null, `${name}-${randomName}${extension}`);
  },
});

@Controller('albums')
export class AlbumsController {
  constructor(
    @InjectModel(Album.name) private albumModel: Model<AlbumDocument>,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('image', { storage }))
  async postAlbums(
    @UploadedFile() file: Express.Multer.File,
    @Body() albumsDto: CreateAlbumDto,
  ) {
    try {
      const album = new this.albumModel({
        album: albumsDto.album,
        artist: albumsDto.artist,
        date: albumsDto.date,
        image: file ? '/uploads/albums/' + file.filename : null,
      });

      await album.save();

      return {message: 'Album successfully created!', album};
    } catch (e) {
      if (e instanceof mongoose.Error.ValidationError) {
        throw new UnprocessableEntityException(e);
      }
      throw e;
    }
  }

  @Get()
  async getAlbumsAndGetByArtist(@Req() req: Request) {
    let query: { artist?: string } = {};
    if (req.query.artist) {
      query.artist = req.query.artist as string;
    }
    const getAllAlbums = await this.albumModel.find(query);
    if (getAllAlbums.length === 0) {
      throw new UnprocessableEntityException(`Albums not found!`);
    }

    return {message: `All artist is successfully GET!`, getAllAlbums};
  }

  @Get(':id')
  async getOneAlbum(@Param('id') id: string) {
    const getOneAlbum = await this.albumModel.findById(id);
    if (!getOneAlbum) {
      throw new NotFoundException(`Album with id: ${id} not found`);
    }

    return {message: `Album with id ${id} found`, getOneAlbum};
  }

  @Delete(':id')
  async getByIdAndDelete(@Param('id') id: string) {
    const album = await this.albumModel.findById(id);
    if (!album) {
      throw new NotFoundException(`Album with id: ${id} not found`);
    }

    const deletedAlbum = await this.albumModel.findByIdAndDelete(id);
    return {message: `Album with id ${id} was been deleted`, deletedAlbum};
  }
}
