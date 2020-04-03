import { Component, OnInit, OnDestroy } from '@angular/core';
import { GlobalService } from 'src/app/services/global.service';
import { roomLite, roomInfo } from 'src/app/types/RoomTypes';
import { PlayerService } from 'src/app/services/player.service';
import { RoomService } from 'src/app/services/room.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-channel',
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.scss']
})
export class ChannelComponent implements OnInit, OnDestroy {
  private _roomName: string = ''
  private s: Subscription

  constructor(
    private roomService: RoomService,
    private globalService: GlobalService,
    private player: PlayerService,
    private route: Router
  ) { }

  ngOnInit(): void {
    console.log('Channel Ready')
    this.globalService.requireRoomList()
    this.s = this.roomService.info.subscribe((info: roomInfo) => {
      this._roomName = info.roomName
    })
  }
  ngOnDestroy(): void {
    this.s.unsubscribe()
  }

  public get currentRoom(): string {
    return this._roomName
  }
  public get channels(): roomLite[] {
    return this.globalService.channelList
  }
  public get isGuest(): boolean {
    return this.player.isGuest
  }

  public moveTo(roomId: number) {
    this.player.movePlayer(roomId)
    this.route.navigate(['room', roomId])
  }
}
