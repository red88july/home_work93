import {SchemaFactory, Schema, Prop} from "@nestjs/mongoose";
import mongoose, {Document} from "mongoose";
import {Album} from "./album.schema";

@Schema()
export class Track {
    @Prop({required: true})
    track: string;

    @Prop({type: [{type: mongoose.Schema.Types.ObjectId, ref: 'Album'}]})
    album: Album

    @Prop({required: true})
    duration: string;

    @Prop({required: true})
    number: number;

    @Prop({default: false})
    isPublished: boolean;

}

export const TrackSchema = SchemaFactory.createForClass(Track);
export type TrackDocument = Track & Document;