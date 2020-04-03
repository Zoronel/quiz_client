import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { NgForm } from '@angular/forms';
import { roomInfo } from 'src/app/types/RoomTypes';
import { playerLite } from 'src/app/types/PlayerTypes';
import { RoomService } from 'src/app/services/room.service';
import { PlayerService } from 'src/app/services/player.service';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit, OnDestroy {

  private s: Subscription

  private _roomName: string = ''
  private _roomId: number = -1
  private _roomIsLobby: boolean = true
  private _question: string = ''
  private _playerList: playerLite[] = []
  private _roomGmName: string = ''
  private _roomGmId: string = ''

  private _bookingList: { playerId: string, timestampBooking: number, playerName: String }[] = []

  constructor(
    private playerService: PlayerService,
    private roomService: RoomService,
    private thisRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    console.log('Room Ready');
    const s1 = this.roomService.info.subscribe((info: roomInfo) => {
      this._roomName = info.roomName
      this._roomId = info.roomId
      this._roomIsLobby = info.roomIsLobby
      this._roomGmName = info.roomGm
      this._roomGmId = info.roomGmId
      this._question = info.roomQuestion
    })

    const s2 = this.roomService.userList.subscribe((data: playerLite[]) => {
      this._playerList = data
    })

    const s3 = this.roomService.question.subscribe((data: string) => {
      this._question = data
      this._bookingList = []
    })

    const s4 = this.thisRoute.paramMap.subscribe(params => {
      const _id: string = params.get('id')
      const r_id = parseInt(_id)
      this.roomService.setRoom(r_id)
    })
    this.s = s1
    this.s.add(s2).add(s3).add(s4)
    if (this.playerService.role == PlayerService.ROLE_GM) {
      const s5 = this.roomService.reservations.subscribe((data) => {
        const p = this._playerList.getItemsWithProperty<playerLite>('id', data.playerId)
        if (p == undefined) return
        const bookingElement = {
          playerId: data.playerId,
          playerName: p.userName,
          timestampBooking: data.timeBooking
        }
        this._bookingList.push(bookingElement)
        this._bookingList.sort((a, b): number => {
          if (a.timestampBooking < b.timestampBooking) return -1
          if (a.timestampBooking > b.timestampBooking) return 1
          return 0
        })
      })
      this.s.add(s5)
    }
  }

  ngOnDestroy(): void {
    this.s.unsubscribe()
  }

  public get name(): string {
    return this._roomName
  }

  public get isLobby(): boolean {
    return this._roomIsLobby
  }

  public get question(): string {
    return this._question
  }

  public get players(): playerLite[] {
    return this._playerList
  }

  public get bookingList(): { playerId: string, timestampBooking: number, playerName: String }[] {
    return this._bookingList
  }

  public get isGM(): boolean {
    return this.playerService.role == PlayerService.ROLE_GM
  }

  public sendAnswer() {
    this.roomService.sendReservation()
  }

  public allowResponse(playerId: string): void {
    this.roomService.allowResponse(playerId)
  }

}
