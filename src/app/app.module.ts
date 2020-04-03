import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import './prototype'

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { ChannelComponent } from './components/channel/channel.component';
import { RoomComponent } from './components/room/room.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { NewroomComponent } from './components/newroom/newroom.component';
import { RoomCommandsComponent } from './components/room-commands/room-commands.component';
import { DialogComponent } from './components/dialog/dialog.component';

import { ConnectionService } from './services/connection.service';
import { PlayerService } from './services/player.service';
import { RoomService } from './services/room.service';
import { GlobalService } from './services/global.service';
import { DialogService } from './services/dialog.service';


@NgModule({
  declarations: [
    AppComponent,
    ChannelComponent,
    RoomComponent,
    WelcomeComponent,
    NewroomComponent,
    RoomCommandsComponent,
    DialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  exports: [],
  providers: [
    ConnectionService,
    GlobalService,
    PlayerService,
    RoomService,
    DialogService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
