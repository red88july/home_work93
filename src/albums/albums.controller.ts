import {
    Body,
    Controller, Delete, Get,
    HttpStatus, NotFoundException, Param,
    Post, Req,
    Res,
    UnprocessableEntityException,
    UploadedFile,
    UseInterceptors
} from '@nestjs/common';
import {FileInterceptor} from "@nestjs/platform-express";
import {Request, Response} from "express";
import {CreateArtistDto} from "../artists/create-artist.dto";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {Album, AlbumDocument} from "../schemas/album.schema";
import {diskStorage} from "multer";
import {extname} from "path";
import {randomUUID} from "crypto";
import {CreateAlbumDto} from "./create-album.dto";

const storage = diskStorage({
    destination: './public/uploads/album',
    filename: (_req, file, cb) => {
        const name = file.originalname.split('.')[0];
        const extension = extname(file.originalname);
        const randomName = randomUUID();
        cb(null, `${name}-${randomName}${extension}`);
    },
});

@Controller('albums')
export class AlbumsController {

    constructor(@InjectModel(Album.name) private albumModel: Model<AlbumDocument>) {
    }

    @Post()
    @UseInterceptors(FileInterceptor('image', {storage}))
    async postAlbums(
        @Res() res: Response,
        @UploadedFile() file: Express.Multer.File,
        @Body() albumsDto: CreateAlbumDto
    ) {
        try {
            const album = new this.albumModel({
                album: albumsDto.album,
                artist: albumsDto.artist,
                date: albumsDto.date,
                image: file ? '/uploads/album/' + file.filename : null,
            })

            await album.save();

            return res.status(HttpStatus.CREATED).json({
                message: 'Album successfully created!',
                album: album,
            })
        } catch (e) {
            throw new UnprocessableEntityException(`Cannot work with this data ${e}`);
        }

    }

    @Get()
    async getAlbumsAndGetByArtist(
        @Req() req: Request,
        @Res() res: Response,
    ) {
        let query: { artist?: string } = {};
        if (req.query.artist) {
            query.artist = req.query.artist as string;
        }
        const getAllAlbums = await this.albumModel.find(query);
        if (getAllAlbums.length === 0) {
            throw new UnprocessableEntityException(`Albums not found!`);
        }

        return res.status(HttpStatus.OK).json({
            message: `All artist is successfully GET!`,
            album: getAllAlbums
        });
    }

    @Get(':id')
    async getOneAlbum(
        @Res() res: Response,
        @Param('id') id: string) {

        const getOneAlbum = await this.albumModel.findById(id);
        if (!getOneAlbum) {
            throw new NotFoundException(`Album with id: ${id} not found`);
        }

        return res.status(HttpStatus.OK)
            .json({
                message: `Album with id ${id} found`,
                album: getOneAlbum
            });
    }

    @Delete(':id')
    async getByIdAndDelete(
        @Res() res: Response,
        @Param('id') id: string
    ) {
        const album = await this.albumModel.findById(id);

        if (!album) {
            throw new NotFoundException(`Album with id: ${id} not found`);
        }

        const deletedAlbum = await this.albumModel.findByIdAndDelete(id)
        return res.status(HttpStatus.OK)
            .json({
                message: `Album with id ${id} was been deleted`,
                artist: deletedAlbum
            });
    }
}
