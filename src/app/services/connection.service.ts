import { Injectable } from '@angular/core';
import * as client from 'socket.io-client'
import { Socket } from "socket.io-client";
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { SocketEvent } from 'src/app/classes/socket-event';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConnectionService {
  private connection: Socket
  private globalEvent: Subject<any> = new Subject<any>()
  private playerEvent: Subject<any> = new Subject<any>()
  private roomEvent: Subject<any> = new Subject<any>()
  // private connectionSubject
  constructor(
    private router: Router,
  ) {
    console.log('Connection Service Ready')
    this.connection = client.connect(this.connectionString, {
      reconnection: true,
      reconnectionDelay: 1000,
      onlyBinaryUpgrades: true,
    })

    this.connection.on("whoyouare", () => {
      console.log('identity required')
      this.router.navigate(['welcome'])
    })

    this.connection.on("socket-event", (data: any) => {
      this.newEvent(data)
    })
  }

  private get connectionString(): string {
    return "http://" + environment.host + ":" + environment.port// + "/" + this.path
  }

  public rawEmit(eventName: string, dataEvent: any) {
    this.connection.emit(eventName, dataEvent);
  }

  public emit(connectionEvent: SocketEvent) {
    this.connection.emit(SocketEvent.BASE_NAME, connectionEvent.event)
  }

  private newEvent(data: { hasOwnProperty: (arg0: string) => any; type: string; name: string; data: any; }) {
    if (typeof (data) != 'object' || !data.hasOwnProperty('type')) {
      console.error('Response data is Invalid')
    } else {
      console.log('Routing new server event', data)
      const type: string = data.type!
      const eventName: string = data.name
      const eventData: any = data.data
      const thisEvent = { event: eventName, data: eventData }
      switch (type) {
        case 'Player':
          this.playerEvent.next(thisEvent)
          break;
        case 'Room':
          this.roomEvent.next(thisEvent)
          break
        case 'Global':
          this.globalEvent.next(thisEvent)
          break
        default:
          console.log('Type', type, 'non gestito')
      }
    }
  }

  public getObservableEvt(serviceName: string): Observable<any> {
    switch (serviceName) {
      case 'Player':
        return this.playerEvent.asObservable()
        break;
      case 'Room':
        return this.roomEvent.asObservable()
        break;
      case 'Global':
        return this.globalEvent.asObservable()
        break;
      default:
        console.log('Type', serviceName, 'non gestito')
    }
  }

}
