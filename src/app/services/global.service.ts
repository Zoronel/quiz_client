import { Injectable } from '@angular/core';
import { ConnectionService } from './connection.service';
import { roomLite } from '../types/RoomTypes';
import { SocketEvent } from '../classes/socket-event';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  public channelList: roomLite[]

  constructor(
    private connection: ConnectionService
  ) {
    console.log('Global Service Ready')
    this.connection.getObservableEvt('Global').subscribe((data) => {
      switch (data.event) {
        case 'refresh_roomlist':
          this.channelList = data.data.rooms
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
