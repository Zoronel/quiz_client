import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { interval, Subject, Subscription } from 'rxjs';
import { throttle } from 'rxjs/operators';
import { SocketEvent } from 'src/app/classes/socket-event';
import { ConnectionService } from 'src/app/services/connection.service';
import { DialogService } from 'src/app/services/dialog.service';
import { PlayerService } from 'src/app/services/player.service';
import { RoomService } from 'src/app/services/room.service';
import { playerLite } from 'src/app/types/PlayerTypes';
import { roomInfo } from 'src/app/types/RoomTypes';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit, OnDestroy {

  private _typingSubj: Subject<void> = new Subject

  private subCollector: Subscription[] = []

  private _roomName: string = ''
  private _roomId: number = -1
  private _roomIsLobby: boolean = true
  private _question: string = ''
  private _playerList: playerLite[] = []
  private _roomGmName: string = ''
  private _roomGmId: string = ''

  private _bookingList: { playerId: string, timestampBooking: number, playerName: String, isTyping: boolean }[] = []

  public reservetionSended: boolean = false
  public surrended: boolean = false
  public gmIsTyping: boolean = false

  constructor(
    private connection: ConnectionService,
    private playerService: PlayerService,
    private roomService: RoomService,
    private thisRoute: ActivatedRoute,
    private dialogs: DialogService
  ) { }

  ngOnInit(): void {
    console.log('Room Ready');
    this.subCollector.push(this.roomService.info.subscribe((info: roomInfo) => {
      this._roomName = info.roomName
      this._roomId = info.roomId
      this._roomIsLobby = info.roomIsLobby
      this._roomGmName = info.roomGm
      this._roomGmId = info.roomGmId
      this._question = info.roomQuestion
    }))

    this.subCollector.push(this.roomService.userList.subscribe((data: playerLite[]) => {
      this._playerList = data
    }))

    this.subCollector.push(this.roomService.question.subscribe((data: string) => {
      this._question = data
      if (this.playerService.role == PlayerService.ROLE_GM) {
        this._bookingList = []
      }
      if (this.playerService.role == PlayerService.ROLE_PLAYER) {
        this.reservetionSended = false
        this.surrended = false
      }
    }))

    this.subCollector.push(this.roomService.playerSurrender.subscribe((data: string) => {
      if (this.playerService.myId == data) {
        this.surrended = true
      } else {
        const surrendedPlayer = this._playerList.find(p => p.id == data)
        if (this.playerService.role == PlayerService.ROLE_PLAYER) {
          this.dialogs.info('Il giocatore ' + surrendedPlayer.userName + ' si è arreso. Il Gm sceglierà qualcun\'altro per rispondere', 'Attenzione')
        } else {
          const surrendedIdx = this.bookingList.findIndex(p => p.playerId == data)
          if (surrendedIdx >= 0) this.bookingList.splice(surrendedIdx, 1)
          if (this.bookingList.length == 0) {
            this.dialogs.ask('Non ci sono più giocatori in lista per rispondere. Vuoi inserire una nuova domanda?', 'Attenzione',
              undefined,
              (confirm: boolean) => {
                if (confirm) this.openNewQuestion()
              }
            )
          } else {
            this.dialogs.info('Il giocatore ' + surrendedPlayer.userName + ' si è arreso. Scegli qualcun\'altro per rispondere', 'Attenzine')
          }
        }
      }
    }))

    this.subCollector.push(this._typingSubj.pipe(throttle(() => interval(2000))).subscribe(() => {
      console.log('Send typing')
      this.connection.emit(new SocketEvent('typing', 'Room'))
    }))

    this.subCollector.push(this.thisRoute.paramMap.subscribe(params => {
      const _id: string = params.get('id')
      const r_id = parseInt(_id)
      this.roomService.setRoom(r_id)
    }))

    if (this.playerService.role == PlayerService.ROLE_GM) {
      this.subCollector.push(this.roomService.reservations.subscribe((data) => {
        const p = this._playerList.getItemsWithProperty<playerLite>('id', data.playerId)
        if (p == undefined) return
        const bookingElement = {
          playerId: data.playerId,
          playerName: p.userName,
          timestampBooking: data.timeBooking,
          isTyping: false
        }
        this._bookingList.push(bookingElement)
        this._bookingList.sort((a, b): number => {
          if (a.timestampBooking < b.timestampBooking) return -1
          if (a.timestampBooking > b.timestampBooking) return 1
          return 0
        })
      }))

      let typingTimeout: any
      this.subCollector.push(this.roomService.playerIsTyping.subscribe((data) => {
        const bookedPlayer = this._bookingList.find(p => p.playerId == data)
        if (bookedPlayer) {
          clearTimeout(typingTimeout)
          bookedPlayer.isTyping = true
          typingTimeout = setTimeout(() => {
            bookedPlayer.isTyping = false
          }, 2000)
        }
      }))

      this.subCollector.push(this.roomService.playersAnswer.subscribe((data) => {
        const bookedPlayer = this._bookingList.find(p => p.playerId == data.playerId)
        const answer = data.answer.trim()
        if (!bookedPlayer) {
          this.dialogs.error('Player non trovato tra quelli prenotati per rispondere')
          return
        }
        if (answer.length == 0) {
          this.dialogs.error('La risposta sembra essere vuota')
          return
        }
        this.dialogs.open('newAsnwer', { playerName: bookedPlayer.playerName, answer: answer }, undefined, (correct: boolean) => {
          if (correct) {
            this.connection.emit(new SocketEvent('answer_found', 'Room', { playerId: bookedPlayer.playerId, answer: answer }))
            this.openNewQuestion()
          } else {
            this.connection.emit(new SocketEvent('answer_not_found', 'Room', { playerId: bookedPlayer.playerId }))
          }
        })
      })
      )
    }
    if (this.playerService.role == PlayerService.ROLE_PLAYER) {
      this.subCollector.push(this.playerService.roomAnswerAllowed.subscribe(data => {
        const result: boolean = data.result
        if (result) {
          this.dialogs.open("answerInput", undefined, undefined, (data: { result: boolean, answer: string }) => {
            let sktEvent: SocketEvent
            if (data.result) {
              const answer = data.answer.trim()
              if (answer.length == 0) {
                console.error('Risposta vuota');
                this.dialogs.error('Inserisci una Risposta', 'Attenzione!')
                return false
              }
              sktEvent = new SocketEvent('new_answer', 'Room', answer)
            } else {
              sktEvent = new SocketEvent('player_surrender', 'Room', {})
            }
            this.connection.emit(sktEvent)
            return true
          })
        } else {
          this.dialogs.info('Non sei stato selezionato per rispondere. Risponderà l\'utente ' + data.allowedUser, 'Spiacente')
        }
      }))

      let typingTimeout: any
      this.subCollector.push(this.roomService.gmIsTyping.subscribe(() => {
        clearTimeout(typingTimeout)
        this.gmIsTyping = true
        typingTimeout = setTimeout(() => {
          this.gmIsTyping = false
        }, 2000)
      }))

      this.subCollector.push(this.roomService.answerUpdate.subscribe(data => {
        const thatPlayerName: String = this._playerList.find(p => p.id == data.playerId)?.userName || '[user not found]'
        if (data.found) {
          if (data.playerId == this.playerService.myId) {
            this.dialogs.info('Risposta corretta!', 'Complimenti!')
          } else {
            this.dialogs.info('il giocatore ' + thatPlayerName + ' ha dato la risposta corretta.\nLa risposta era ' + data.answerWas || '[?]' + '.\n Buona fortuna per la prossima domanda!', 'Attenzaione')
          }
        } else {
          if (data.playerId == this.playerService.myId) {
            this.dialogs.error('Risposta errata, spiancente. Il Gm sceglierà il nuovo giocatore per rispondere', 'Spiacente')
          } else {
            this.dialogs.info('Il giocatore ' + thatPlayerName + ' ha dato la risposta errata. Il Gm adesso sceglierà il prossimo giocatore per rispondere', 'Attenzione')
          }
        }
      }))
    }
  }

  ngOnDestroy(): void {
    // this.s.unsubscribe()
    for (const s of this.subCollector) {
      s.unsubscribe()
    }
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

  public get bookingList(): { playerId: string, timestampBooking: number, playerName: String, isTyping: boolean }[] {
    return this._bookingList
  }

  public get isGM(): boolean {
    return this.playerService.role == PlayerService.ROLE_GM
  }

  public startTyping(): void {
    this._typingSubj.next()
  }

  /* PALYER ONLY */

  public sendAnswer(): void {
    // this.roomService.sendReservation()
    if (this.reservetionSended) return
    this.reservetionSended = true
    const thisEvt = new SocketEvent('room_booking', 'Room', {})
    this.connection.emit(thisEvt)
  }
  /* -------- */

  /* MASTER ONLY */
  public allowResponse(playerId: string): void {
    const thisPlayer = this.bookingList.find(u => u.playerId == playerId)
    if (!thisPlayer) {
      console.error('Player [', playerId, '] not fund')
      return
    }
    this.dialogs.open('confirmAllowUser', { userName: thisPlayer.playerName, hideClose: true }, undefined, (data: any) => {
      if (data === true) {
        // this.roomService.allowResponse(playerId)
        const thisEvt = new SocketEvent('allow_answer', 'Room', { roomId: this._roomId, playerId: playerId })
        this.connection.emit(thisEvt)
      }
    })
  }
  private openNewQuestion(): void {
    this.dialogs.open('newQuestion', undefined, undefined, (data) => {
      if (data.continue) {
        const question = data.question
        if (question.trim().length == 0) {
          this.dialogs.error('La domanda è vuota')
          return false
        }
        this.connection.emit(new SocketEvent('new_question', 'Room', question))
      } else {
        this.roomService.closeRoom()
      }
    })
  }
  /* ------- */
}
