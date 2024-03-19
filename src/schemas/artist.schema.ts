import { Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import { Document } from "mongoose";

export type ArtistDocument = Artist & Document;

@Schema ()
export class Artist {
    @Prop({ required: true, unique: true})
    author: string;

    @Prop()
    photo: string;

    @Prop()
    info: string;

    @Prop({ default: false })
    isPublished: true;
}

export const ArtistSchema = SchemaFactory.createForClass(Artist);