import {
    Body,
    Controller, Delete, Get,
    HttpStatus, NotFoundException, Param,
    Post, Req,
    Res,
    UnprocessableEntityException,
} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {Request, Response} from "express";
import {Track, TrackDocument} from "../schemas/track.schema";
import {CreateTrackDto} from "./create-track.dto";

@Controller('tracks')
export class TracksController {
    constructor(@InjectModel(Track.name) private trackModel: Model<TrackDocument>) {}

    @Post()
    async postArtist(
        @Res() res: Response,
        @Body() trackDto: CreateTrackDto
    ) {
        try {
            const track = new this.trackModel({
                number: trackDto.number,
                track: trackDto.track,
                album: trackDto.album,
                duration: trackDto.duration
            })

            await track.save();

            return res.status(HttpStatus.CREATED).json({
                message: 'Track successfully created!',
                track: track,
            })
        } catch (e) {
            throw new UnprocessableEntityException(`Cannot work with this data ${e}`);
        }
    }

    @Get()
    async getTracksAndGetByAlbum(
        @Req() req: Request,
        @Res() res: Response,
    ) {
        let query: { album?: string } = {};
        if (req.query.album) {
            query.album = req.query.album as string;
        }
        const getAllTracks = await this.trackModel.find(query);
        if (getAllTracks.length === 0) {
            throw new UnprocessableEntityException(`Tracks not found!`);
        }

        return res.status(HttpStatus.OK).json({
            message: `All tracks is successfully GET!`,
            tracks: getAllTracks
        });
    }

    @Get(':id')
    async getOneTrack(
        @Res() res: Response,
        @Param('id') id: string) {

        const getOneTrack = await this.trackModel.findById(id);
        if (!getOneTrack) {
            throw new NotFoundException(`Track with id: ${id} not found`);
        }

        return res.status(HttpStatus.OK)
            .json({
                message: `Track with id ${id} found`,
                track: getOneTrack
            });
    }

    @Delete(':id')
    async getByIdAndDelete(
        @Res() res: Response,
        @Param('id') id: string
    ) {
        const track = await this.trackModel.findById(id);

        if (!track) {
            throw new NotFoundException(`Track with id: ${id} not found`);
        }

        const deletedTrack = await this.trackModel.findByIdAndDelete(id)
        return res.status(HttpStatus.OK)
            .json({
                message: `Track with id ${id} was been deleted`,
                track: deletedTrack
            });
    }
}
