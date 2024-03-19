import {SchemaFactory, Schema, Prop} from "@nestjs/mongoose";
import mongoose, {Document} from "mongoose";
import {Artist} from "./artist.schema";

@Schema()
export class Album {
    @Prop( { required: true, unique: true})
    album: string;

    @Prop({ ref: Artist.name, required: true, unique: true })
    artist: mongoose.Schema.Types.ObjectId

    @Prop({required: true, min: 0})
    date: number;

    @Prop()
    image: string;

    @Prop({default: false})
    isPublished: boolean;

}

export const AlbumSchema = SchemaFactory.createForClass(Album);
export type AlbumDocument = Album & Document;