import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TimerService {
  private $timer: Subject<number> = new Subject<number>()
  constructor() {
    setInterval(() => { this.intervalClbk() }, 1000)
  }

  private intervalClbk(): void {
    const date: number = +new Date
    // console.log("Emitting:", date)
    this.$timer.next(date)
  }

  public get timestampObservable(): Observable<number> {
    return this.$timer.asObservable()
  }

  public get timestampObservableHalf(): Observable<number> {
    return this.$timer.pipe(
      filter((timestamp, index) => {
        return !!(timestamp % 2)
      })
    )
  }
}
