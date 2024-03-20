import {
    Body,
    Controller,
    Delete,
    Get, HttpException, HttpStatus, Next, NotFoundException,
    Param,
    Post,
    Req, Res,
    UploadedFile,
    UploadedFiles,
    UseInterceptors
} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Artist, ArtistDocument} from "../schemas/artist.schema";
import {Model} from "mongoose";
import {CreateUserDto} from "./create-user.dto";
import {FileInterceptor} from "@nestjs/platform-express";
import {diskStorage} from "multer";
import {extname} from 'path';
import {randomUUID} from "crypto";
import {onErrorResumeNext} from "rxjs";

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
    constructor(@InjectModel(Artist.name) private artistModel: Model<ArtistDocument>) {
    }

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
            photo: file ? '/uploads/artists/' + file.filename : null,
        })


        return user.save();
    }

    @Get()
    getAll() {
        return this.artistModel.find();
    }

    @Get(':id')
    getOneArtist(@Param('id') id: string) {
        return this.artistModel.findById(id);
    }

    @Delete('delete/:id')
    async getByIdAndDelete(
        @Res() res: any,
        @Param('id') id: string
    ) {
        const artist = await this.artistModel.findById(id);

        if (!artist) {
            throw new NotFoundException('User not found');
        }

        const deletedArtist = await this.artistModel.findByIdAndDelete(id)
        return res.status(HttpStatus.OK)
            .json({
                message: 'User was been deleted',
                artist: deletedArtist
            });
    }
}