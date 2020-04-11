import { Component, OnInit, OnDestroy } from '@angular/core';
import { RoomService } from 'src/app/services/room.service';
import { PlayerService } from 'src/app/services/player.service';
import { Subscription } from 'rxjs';
import { playerLite } from 'src/app/types/PlayerTypes';

@Component({
  selector: 'app-room-commands',
  templateUrl: './room-commands.component.html',
  styleUrls: ['./room-commands.component.scss']
})
export class RoomCommandsComponent implements OnInit, OnDestroy {
  private s: Subscription

  private _playerRole: number = this.playerService.role
  private _playerList: playerLite[] = []

  constructor(
    private roomService: RoomService,
    private playerService: PlayerService
  ) { }

  ngOnInit(): void {
    console.log('Room commands ready')
    const s1 = this.playerService.roleUpdate.subscribe((role: number) => {
      this._playerRole = role
    })

    const s2 = this.roomService.userList.subscribe((data: playerLite[]) => {
      this._playerList = data
    })
    this.s = s1
    this.s.add(s2)
  }
  ngOnDestroy(): void {
    this.s.unsubscribe()
  }

  public get players(): playerLite[] {
    return this._playerList
  }

  public isGm(): boolean {
    return this._playerRole == PlayerService.ROLE_GM
  }

  public closeRoom(): void {
    this.roomService.closeRoom()
  }
  public leaveRoom(): void {
    this.roomService.leaveRoom()
  }
}
