import { Injectable } from '@angular/core';
import { ConnectionService } from './connection.service';
import { roomLite } from '../types/RoomTypes';
import { SocketEvent } from '../classes/socket-event';
import { DialogService } from './dialog.service';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  public channelList: roomLite[]

  constructor(
    private connection: ConnectionService,
    private dialogs: DialogService
  ) {
    console.log('Global Service Ready')
    this.connection.getObservableEvt('Global').subscribe((data) => {
      switch (data.event) {
        case 'refresh_roomlist':
          this.channelList = data.data.rooms
          break
        case 'error':
          let msg: string
          if (typeof data.data == 'object' && data.data.hasOwnProperty('msg')) msg = data.data.msg
          if (typeof data.data == 'string') msg = data.data

          if (msg.length == 0) {
            console.log('Empty error')
          } else {
            this.dialogs.error(msg, 'Errore')
          }
          break
        default:
          console.error('Event', data.event, 'non ancora gestito', data)
          break
      }
    })
  }

  public requireRoomList(): void {
    const request: SocketEvent = new SocketEvent('room_list', 'RoomCollector')
    this.connection.emit(request)
  }
}
