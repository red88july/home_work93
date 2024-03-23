import {
    Body, Controller, Delete, Get,
    NotFoundException, Param, Post,
    Req,UnprocessableEntityException,
} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import mongoose, {Model} from "mongoose";
import {Request, Response} from "express";
import {Track, TrackDocument} from "../schemas/track.schema";
import {CreateTrackDto} from "./create-track.dto";

@Controller('tracks')
export class TracksController {
    constructor(@InjectModel(Track.name) private trackModel: Model<TrackDocument>) {
    }

    @Post()
    async postArtist(@Body() trackDto: CreateTrackDto) {
        try {
            const track = new this.trackModel({
                number: trackDto.number,
                track: trackDto.track,
                album: trackDto.album,
                duration: trackDto.duration
            })

            await track.save();

            return {message: 'Track successfully created!', track}
        } catch (e) {
           if (e instanceof mongoose.Error.ValidationError) {
                throw new UnprocessableEntityException(e)
            }
            throw e;
        }
    }

    @Get()
    async getTracksAndGetByAlbum(@Req() req: Request) {
        let query: { album?: string } = {};
        if (req.query.album) {
            query.album = req.query.album as string;
        }
        const getAllTracks = await this.trackModel.find(query);
        if (getAllTracks.length === 0) {
            throw new UnprocessableEntityException(`Tracks not found!`);
        }

        return {message: `All tracks is successfully GET!`, getAllTracks};
    }

    @Get(':id')
    async getOneTrack(@Param('id') id: string) {
        const getOneTrack = await this.trackModel.findById(id);
        if (!getOneTrack) {
            throw new NotFoundException(`Track with id: ${id} not found`);
        }

        return {message: `Track with id ${id} found`, getOneTrack};
    }

    @Delete(':id')
    async getByIdAndDelete(@Param('id') id: string) {
        const track = await this.trackModel.findById(id);

        if (!track) {
            throw new NotFoundException(`Track with id: ${id} not found`);
        }

        const deletedTrack = await this.trackModel.findByIdAndDelete(id)
        return {message: `Track with id ${id} was been deleted`, deletedTrack};
    }
}
