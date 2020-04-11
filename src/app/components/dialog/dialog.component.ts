import { Component, OnInit, ViewEncapsulation, Input, OnDestroy, HostBinding, AfterViewInit, ElementRef } from '@angular/core';
import { DialogService } from 'src/app/services/dialog.service';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DialogComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() public id: string
  @HostBinding('class.open') get isOpen() { return this._showing }
  @HostBinding('class.closed') get isClosed() { return !this._showing }

  private _showing: boolean = false

  private _inputs: Node[] = []
  private _onOpen: () => boolean | void
  private _onClose: (data: any) => boolean | void

  public options: { [key: string]: any }

  constructor(
    private dialog: DialogService,
    private elt: ElementRef
  ) { }

  ngOnInit(): void {
    console.log('Init Dialog', this.id)
    this.dialog.add(this)
    this._showing = false
  }
  ngOnDestroy(): void {
    console.log('Destroy Dialog', this.id)
    this.dialog.remove(this)
  }
  ngAfterViewInit() {
    const items: NodeList = this.elt.nativeElement.childNodes[0].children[0].childNodes
    items.forEach((n: Node) => {
      if (n.nodeName == 'INPUT' || n.nodeName == 'TEXTAREA') {
        this._inputs.push(n)
      }
    })
  }

  public open(options?: { [key: string]: any }, onOpen?: () => boolean | void, onClose?: (data: any) => boolean | void) {
    this._onOpen = onOpen
    this._onClose = onClose
    if (options == undefined) options = {}
    if (Object.keys(options).length == 0 || !options.hasOwnProperty('hideClose')) options['hideClose'] = false
    this.options = options

    let goOn: boolean = true
    if (this._onOpen != undefined) {
      const or = this._onOpen()
      if (typeof or == 'boolean') goOn = or
    }
    if (goOn) {
      for (const n of this._inputs) {
        let thatElem: any
        if (n.nodeName == 'INPUT') {
          thatElem = <HTMLInputElement>n
        } else if (n.nodeName == 'TEXTAREA') {
          thatElem = <HTMLTextAreaElement>n
        } else {
          continue
        }
        thatElem.value = ''
      }
      this._showing = true
    }
  }

  public close(data?: any): void {
    let goOn: boolean = true
    if (this._onClose != undefined) {
      const cr: boolean | void = this._onClose(data)
      if (typeof cr == 'boolean') goOn = cr
    }
    if (goOn) {
      this._showing = false

      this.options = undefined
      this._onOpen = undefined
      this._onClose = undefined
    }

  }

  public forceOpen() {
    this._showing = true
  }

  public forceClose() {
    this._showing = false
  }

}
