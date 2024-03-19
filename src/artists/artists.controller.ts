import {Body, Controller, Get, Post, Req, UploadedFile, UploadedFiles, UseInterceptors} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Artist, ArtistDocument} from "../schemas/artist.schema";
import {Model} from "mongoose";
import {CreateUserDto} from "./create-user.dto";
import {AnyFilesInterceptor, FileFieldsInterceptor, FileInterceptor} from "@nestjs/platform-express";

@Controller('artists')
export class ArtistsController {
    constructor(@InjectModel(Artist.name) private artistModel: Model<ArtistDocument>) {}
    @Post()
    @UseInterceptors(
        FileInterceptor(
            'photo',
            {dest: './public/uploads/artists'})
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