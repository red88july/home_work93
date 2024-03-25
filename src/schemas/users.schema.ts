import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {Document} from 'mongoose';
import {randomUUID} from "crypto";

import { hash, compare, genSalt } from 'bcrypt';
import {Role} from "../users/role.enum";

const SALT_WORK = 10;

export interface UserMethods {
    checkPassword(password: string): Promise<Boolean>;
    generatedToken(): void;
}
@Schema({versionKey: false})
export class User {
    @Prop( {
        unique: true,
        required: true,
        autoIndex: true,
        useCreateIndex: true,
    })
    email: string;

    @Prop({required: true})
    password: string;

    @Prop({required: true})
    token: string;

    @Prop({
        required: true,
        enum: Role,
        default: Role.USER
    })
    role: Role;

    @Prop({required: true})
    displayName: string;

    @Prop()
    avatar: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods.generatedToken = function () {
    this.token = randomUUID();
}

UserSchema.methods.checkPassword = function (password: string) {
    return compare(password, this.password);
}

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await genSalt(SALT_WORK);
    this.password = await hash(this.password, salt);
    next();
});

UserSchema.set('toJSON', {
    transform: (_doc, ret, _options) => {
        delete ret.password;
        return ret;
    }
})

export type UserDocument = User & Document & UserMethods;