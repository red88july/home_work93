import {MongooseModule, Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema ()
export class Artist {

    @Prop({
        unique: true,
        required: true,
        autoIndex: true,
        useCreateIndex: true
    })
    author: string;

    @Prop()
    photo: string;

    @Prop()
    info: string;

    @Prop({ default: false })
    isPublished: true;
}

export const ArtistSchema = SchemaFactory.createForClass(Artist);
export type ArtistDocument = Artist & Document;