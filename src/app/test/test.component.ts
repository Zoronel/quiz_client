import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { TimerService } from '../timer.service';
import { Subscription, Observable } from 'rxjs';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {
  @Input() public userName: string
  @Output() public oggi: EventEmitter<string> = new EventEmitter<string>()

  public dataAttuale: Date = new Date()
  public mezzaData: Date = new Date()

  private _datePassate: Date[] = []

  private s?: Subscription

  constructor(
    private router: Router,
    private timing: TimerService
  ) { }

  ngOnInit(): void {
    console.log('on init', this.userName);

    this.s = this.timing.timestampObservable.subscribe((segnaleOrario: number) => {
      this.dataAttuale = new Date(segnaleOrario)
      this._datePassate.unshift(this.dataAttuale)
    })

    this.s.add(this.timing.timestampObservableHalf.subscribe((mezzoTS: number) => {
      this.mezzaData = new Date(mezzoTS)
    }))
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.s?.unsubscribe()
  }

  public get exposedTimer(): Observable<number> {
    return this.timing.timestampObservable
  }

  public calcDate(): void {
    const date = new Date().toUTCString()
    this.oggi.emit(date)
  }

  public goTo(path: string): void {
    console.log(path)
    this.router.navigate([path])
  }

  public get datePassate() {
    return this._datePassate.slice(1)
  }
}
