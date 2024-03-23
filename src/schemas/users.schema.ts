import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {Document} from 'mongoose';

@Schema()
export class User {
    @Prop( {
        unique: true,
        required: true,
        autoIndex: true,
        useCreateIndex: true
    })
    email: string;

    @Prop({required: true})
    password: string;

    @Prop({required: true})
    token: true;

    @Prop({
        required: true,
        enum: ['admin', 'user'],
        default: 'user'
    })
    role: string;

    @Prop({required: true})
    displayName: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
export type UserDocument = User & Document;