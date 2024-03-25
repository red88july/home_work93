import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {ArtistsController} from './artists/artists.controller';
import {AlbumsController} from './albums/albums.controller';
import {TracksController} from './tracks/tracks.controller';
import {Artist, ArtistSchema} from "./schemas/artist.schema";
import {Album, AlbumSchema} from "./schemas/album.schema";
import {Track, TrackSchema} from "./schemas/track.schema";
import { UsersController } from './users/users.controller';
import {User, UserSchema} from "./schemas/users.schema";
import { AuthService } from './auth/auth.service';
import {PassportModule} from "@nestjs/passport";
import {LocalStrategy} from "./auth/local.strategy";
import {TokenAuthGuard} from "./auth/token-auth.guard";
import {RolesGuardsAdmin} from "./guards/roleAdmin-guard.guard";
import {RolesGuardsUser} from "./guards/roleUser-guard.guard";

@Module({
    imports: [
        MongooseModule.forRoot('mongodb://localhost/musicNest'),
        MongooseModule.forFeature([
            {name: Artist.name, schema: ArtistSchema},
            {name: Album.name, schema: AlbumSchema},
            {name: Track.name, schema: TrackSchema},
            {name: User.name, schema: UserSchema}
        ]),
        PassportModule,
    ],
    controllers: [AppController, ArtistsController, AlbumsController, TracksController, UsersController],
    providers: [AppService, AuthService, LocalStrategy, TokenAuthGuard, RolesGuardsAdmin, RolesGuardsUser],
})
export class AppModule {}