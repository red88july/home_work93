import {SchemaFactory, Schema, Prop} from "@nestjs/mongoose";
import mongoose, {Document} from "mongoose";
import {Album} from "./album.schema";

@Schema({versionKey: false})
export class Track {
    @Prop({required: true})
    number: number;

    @Prop({required: true})
    track: string;

    @Prop({ref: Album.name, required: true})
    album: mongoose.Schema.Types.ObjectId

    @Prop({required: true})
    duration: string;

    @Prop({default: false})
    isPublished: boolean;
}

export const TrackSchema = SchemaFactory.createForClass(Track);
export type TrackDocument = Track & Document;