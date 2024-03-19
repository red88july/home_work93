import {Body, Controller, Get, Post, Req, UploadedFile, UploadedFiles, UseInterceptors} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Artist, ArtistDocument} from "../schemas/artist.schema";
import {Model} from "mongoose";
import {CreateUserDto} from "./create-user.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from 'path';
import { randomUUID } from "crypto";

const storage = diskStorage({
    destination: './public/uploads/artist',
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
    @UseInterceptors(
        FileInterceptor(
            'photo',
            {storage},
        )
    )
    postArtist(
        @UploadedFile() file: Express.Multer.File,
        @Body() usersDto: CreateUserDto
    ) {
        const user = new this.artistModel({
            author: usersDto.author,
            info: usersDto.info,
            photo: file ? '/uploads/artists' + file.filename : null,
        })

        return user.save();
    }

    @Get()
    getAll() {
        return this.artistModel.find();
    }
}