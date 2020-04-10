import { Injectable } from '@angular/core';
import { ConnectionService } from './connection.service';
import { Router } from '@angular/router';
import { SocketEvent } from '../classes/socket-event';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  static ROLE_ND: number = 0
  static ROLE_GM: number = 1
  static ROLE_PLAYER: number = 2

  private _userRoleUpdate: Subject<number> = new Subject<number>()
  private _userAllowedAnswer: Subject<any> = new Subject<any>()

  private _userName: string
  private _role: number
  private _id: string
  private _guest: boolean = true

  constructor(
    private connection: ConnectionService,
    private router: Router
  ) {
    console.log('Player Service Ready')
    this.connection.getObservableEvt('Player').subscribe((data) => {
      switch (data.event) {
        case 'identity_accepted':
          this._userName = data.data.userName
          this._id = data.data.id
          this._guest = false
          break;
        case 'room_welcome':
          console.log('Player.RoomWelcome', data.data)
          this.router.navigate(['room', data.data.currentRoomId])
          break;
        case 'room_ready':
          console.log('Room ready')
          this.router.navigate(['room', data.data])
          break;
        case 'status_update':
          const statusData = data.data
          this._userName = statusData.name
          this._role = statusData.role
          this._userRoleUpdate.next(statusData.role)
          break
        case 'leave_room':
          // router.navigate(['room', 1])
          console.log('Leaving Room')
          break
        case 'answer_allowed':
          this._userAllowedAnswer.next(data.data)
          break
        default:
          console.log('Event', data.event, 'non gestito')
      }
    })
  }

  public set userName(userName: string) {
    this._userName = userName
  }
  public get userName(): string {
    return this._userName
  }

  public get myId(): string {
    return this._id
  }

  public get role(): number {
    return this._role
  }

  public get isGuest(): boolean {
    return this._guest
  }

  public get roleUpdate(): Observable<number> {
    return this._userRoleUpdate.asObservable()
  }
  public get roomAnswerAllowed(): Subject<any> {
    return this._userAllowedAnswer
  }

  public connect(userName: string, role?: number): void {
    if (role == undefined) role = PlayerService.ROLE_ND
    this._role = role
    this.connection.rawEmit('whoiam', { name: userName, role: role })
  }

  public movePlayer(destRoomId: number) {
    const moveEvent = new SocketEvent('move_player', 'RoomCollector', { playerId: this._id, destRoomId: destRoomId })
    this.connection.emit(moveEvent)
  }

}
