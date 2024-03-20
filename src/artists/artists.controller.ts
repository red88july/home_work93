import {
    Body, Controller, Delete, Get, HttpStatus, NotFoundException,
    Param, Post, Res, UnprocessableEntityException,
    UploadedFile,
    UseInterceptors
} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Artist, ArtistDocument} from "../schemas/artist.schema";
import {Model} from "mongoose";
import {CreateArtistDto} from "./create-artist.dto";
import {FileInterceptor} from "@nestjs/platform-express";
import {diskStorage} from "multer";
import {extname} from 'path';
import {randomUUID} from "crypto";
import {Response} from "express";

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
    constructor(@InjectModel(Artist.name) private artistModel: Model<ArtistDocument>) {}

    @Post()
    @UseInterceptors(FileInterceptor('photo', {storage}))
    async postArtist(
        @Res() res: Response,
        @UploadedFile() file: Express.Multer.File,
        @Body() usersDto: CreateArtistDto
    ) {
        try {
            const artist = new this.artistModel({
                author: usersDto.author,
                info: usersDto.info,
                photo: file ? '/uploads/artists/' + file.filename : null,
            })

            await artist.save();

            return res.status(HttpStatus.CREATED).json({
                message: 'Artists successfully created!',
                artist: artist,
            })
        } catch (e) {
            throw new UnprocessableEntityException(`Cannot work with this data ${e}`);
        }
    }

    @Get()
    async getAll(
        @Res() res: Response,
    ) {

        const getAllArtist = await this.artistModel.find();
        if (getAllArtist.length === 0) {
            throw new UnprocessableEntityException(`Artists not found!`);
        }

        return res.status(HttpStatus.OK).json({
            message: `All artist is successfully GET!`,
            artist: getAllArtist
        });
    }

    @Get(':id')
    async getOneArtist(
        @Res() res: Response,
        @Param('id') id: string) {

        const getOneArtist = await this.artistModel.findById(id);
        if (!getOneArtist) {
            throw new NotFoundException(`Artist with id: ${id} not found`);
        }

        return res.status(HttpStatus.OK)
            .json({
                message: `Artist with id ${id} found`,
                artist: getOneArtist
            });
    }

    @Delete(':id')
    async getByIdAndDelete(
        @Res() res: Response,
        @Param('id') id: string
    ) {
        const artist = await this.artistModel.findById(id);

        if (!artist) {
            throw new NotFoundException(`Artist with id: ${id} not found`);
        }

        const deletedArtist = await this.artistModel.findByIdAndDelete(id)
        return res.status(HttpStatus.OK)
            .json({
                message: `Artist with id ${id} was been deleted`,
                artist: deletedArtist
            });
    }
}