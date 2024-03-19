import { Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema ()
export class Artist {
    @Prop({required: true, unique: true})
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