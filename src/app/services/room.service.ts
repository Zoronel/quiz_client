import { Injectable } from '@angular/core';
import { ConnectionService } from './connection.service';
import { SocketEvent } from '../classes/socket-event';
import { roomInfo } from '../types/RoomTypes';
import { Subject, BehaviorSubject } from 'rxjs';
import { PlayerService } from './player.service';
import { playerLite } from '../types/PlayerTypes';

@Injectable({
  providedIn: 'root'
})
export class RoomService {

  private _info: roomInfo
  private _reservetionSended: boolean = false

  private _roomInfoObs: Subject<roomInfo> = new Subject
  private _roomUsersObs: BehaviorSubject<playerLite[]> = new BehaviorSubject<playerLite[]>([])
  private _roomQuestionObs: BehaviorSubject<string> = new BehaviorSubject<string>('')
  private _roomBooking: Subject<{ playerId: string, timeBooking: number }> = new Subject
  private _roomPlayerIsTyping: Subject<string> = new Subject
  private _roomGmIsTyping: Subject<void> = new Subject
  private _roomPlayerAnswer: Subject<{ playerId: string, answer: string }> = new Subject
  private _roomAnswerUpdate: Subject<{ found: boolean, playerId: string, answerWas?: string }> = new Subject
  private _roomPlayerSurrender: Subject<string> = new Subject

  constructor(
    private connection: ConnectionService,
    private player: PlayerService
  ) {
    console.log('Room Service Ready')
    this.connection.getObservableEvt('Room').subscribe((data) => {
      console.log('new room event', data.event)
      switch (data.event) {
        case 'room_info':
          this._info = data.data
          this._roomInfoObs.next(data.data)
          break;
        case 'refresh_userlist':
          this._roomUsersObs.next(data.data.players)
          break;
        case 'new_question':
          this._roomQuestionObs.next(data.data)
          this._reservetionSended = false
          break
        case 'typing':
          this._roomPlayerIsTyping.next(data.data)
          break
        case 'gm_typing':
          this._roomGmIsTyping.next()
          break
        case 'player_reservation':
          console.log('Player reservation received', data.data)
          this._roomBooking.next(data.data)
          break
        case 'new_answer':
          this._roomPlayerAnswer.next(data.data)
          break
        case 'player_surrender':
          this._roomPlayerSurrender.next(data.data)
          break
        case 'answer_found':
          this._roomAnswerUpdate.next({ found: true, playerId: data.data.playerId, answerWas: data.data.answer })
          break
        case 'answer_not_found':
          this._roomAnswerUpdate.next({ found: false, playerId: data.data.playerId })
          break
        default:
          console.error('Event', data.event, 'non gestito', data)
          break
      }
    })
  }

  public get info(): Subject<roomInfo> {
    return this._roomInfoObs
  }
  public get userList(): BehaviorSubject<playerLite[]> {
    return this._roomUsersObs
  }
  public get question(): BehaviorSubject<string> {
    return this._roomQuestionObs
  }
  public get playerIsTyping(): Subject<string> {
    return this._roomPlayerIsTyping
  }
  public get gmIsTyping(): Subject<void> {
    return this._roomGmIsTyping
  }
  public get reservations(): Subject<{ playerId: string, timeBooking: number }> {
    return this._roomBooking
  }
  public get playersAnswer(): Subject<{ playerId: string, answer: string }> {
    return this._roomPlayerAnswer
  }
  public get playerSurrender(): Subject<string> {
    return this._roomPlayerSurrender
  }
  public get answerUpdate(): Subject<{ found: boolean, playerId: string, answerWas?: string }> {
    return this._roomAnswerUpdate
  }

  public setRoom(id: number) {
    if (id <= 0) id = 0
    this._roomUsersObs.next([])
    const thisEvent = new SocketEvent('get_room_info', 'Room', { id: id })
    this.connection.emit(thisEvent)
  }

  public newRoom(roomName: string, roomQuestion: string, roomGmId: string) {
    const thisEvent = new SocketEvent('add_room', 'Room', { roomName: roomName, roomQuestion: roomQuestion, roomGmId: roomGmId })
    this.connection.emit(thisEvent)
  }

  public closeRoom(): void {
    if (this._info.roomId == 1) {
      console.error('Canot Close Lobby')
    } else {
      const thisEvent = new SocketEvent('close_room', 'RoomCollector', this._info.roomId)
      this.connection.emit(thisEvent)
    }
  }
  public leaveRoom(): void {
    if (this._info.roomId == 1) {
      console.error('Canot leave Lobby')
    } else {
      this.player.movePlayer(1)
    }
  }
}
