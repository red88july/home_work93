import {SchemaFactory, Schema, Prop} from "@nestjs/mongoose";
import mongoose, {Document} from "mongoose";
import {Artist} from "./artist.schema";

@Schema()
export class Album {
    @Prop( { required: true, unique: true})
    album: string;

    @Prop({type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artist'}] })
    artist: Artist

    @Prop()
    date: number;

    @Prop()
    image: string;

    @Prop({default: false})
    isPublished: boolean;

}

export const AlbumSchema = SchemaFactory.createForClass(Album);
export type AlbumDocument = Album & Document;