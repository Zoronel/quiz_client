import { Component, OnInit, ViewEncapsulation, Input, OnDestroy, Output, EventEmitter, HostBinding } from '@angular/core';
import { DialogService } from 'src/app/services/dialog.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DialogComponent implements OnInit, OnDestroy {
  @Input() public id: string
  @HostBinding('class.open') get isOpne() { return this._showing }
  @HostBinding('class.closed') get isClosed() { return !this._showing }

  private _showing: boolean = false

  private _onOpen: () => void
  private _onClose: (data: any) => void

  // public showing: boolean
  public title: string
  public options: any

  constructor(
    private dialog: DialogService
  ) { }

  ngOnInit(): void {
    this.dialog.add(this)
    this._showing = false
  }
  ngOnDestroy(): void {
    this.dialog.remove(this)
  }
  public open(options: any, onOpen?: () => void, onClose?: (data: any) => void) {
    this._onOpen = onOpen
    this._onClose = onClose
    this.options = options
    this._showing = true
    if (this._onOpen != undefined)
      Function.call(this._onOpen)
  }
  public close(f?: NgForm): void {
    this._showing = false
    this.title = ''
    this.options = undefined
    if (this._onClose != undefined)
      Function.call(this._onClose, f.value || undefined)

    this._onOpen = undefined
    this._onClose = undefined
  }

}
