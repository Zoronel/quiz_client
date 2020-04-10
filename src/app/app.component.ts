import { Component, OnInit } from '@angular/core';
import { ConnectionService } from './services/connection.service';
import { PlayerService } from './services/player.service';
import { RoomService } from './services/room.service';
import { DialogService } from './services/dialog.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  private _currentRoom: number = -1
  private _isLobby: boolean = true
  private _playerRole: number = 0

  constructor(
    private connection: ConnectionService,
    private player: PlayerService,
    private room: RoomService,
    private dialogs: DialogService
  ) { }

  ngOnInit() {
    console.log('App Ready');
    this.room.info.subscribe((info) => {
      this._currentRoom = info.roomId
      this._isLobby = info.roomIsLobby
    })
    this.player.roleUpdate.subscribe((role: number) => {
      this._playerRole = role
    })
  }

  public playerName(): string {
    return this.player.userName
  }

  public isGuest(): boolean {
    return this.player.isGuest
  }
  public isGm(): boolean {
    return this._playerRole == 1
  }
  public isLobby(): boolean {
    return this._isLobby
  }

}
