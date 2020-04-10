import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private modals: any[] = [];
  private _aDialogIsOpen: boolean = false

  public get aDialogIsOpen(): boolean {
    return this._aDialogIsOpen
  }

  public getDialog(dialogId: string) {
    const thisDialog = this.modals.find(m => m.id == dialogId)
    return thisDialog || undefined
  }

  public add(modal: any): void {
    // add modal to array of active modals
    this.modals.push(modal);
  }
  public remove(modal: any): void {
    const idx = this.modals.indexOf(modal)
    if (idx == -1) return
    this.modals.splice(idx, 1)
  }
  public open(dialogId: string, options?: { [key: string]: any }, onOpen?: () => boolean | void, onClose?: (data: any) => boolean | void) {
    const thisDialog = this.modals.find(m => m.id == dialogId)
    if (thisDialog) {
      thisDialog.open(options, onOpen, onClose)
      this._aDialogIsOpen = true
    }
  }
  public close(dialogId: string, data?: any): void {
    const thisDialog = this.modals.find(m => m.id == dialogId)
    if (thisDialog) {
      thisDialog.close(data)
      this._aDialogIsOpen = false
    }
  }
  public info(message: string, title?: string, onOpen?: () => boolean | void, onClose?: (data: any) => boolean | void) {
    const options = {
      title: title,
      message: message,
      hideClose: false
    }
    this.open('infoDialog', options, onOpen, onClose)
  }

  public warn(message: string, title?: string, onOpen?: () => boolean | void, onClose?: (data: any) => boolean | void) {
    const options = {
      title: title,
      message: message,
      hideClose: false
    }
    this.open('warningDialog', options, onOpen, onClose)
  }

  public error(message: string, title?: string, onOpen?: () => boolean | void, onClose?: (data: any) => boolean | void) {
    const options = {
      title: title,
      message: message,
      hideClose: false
    }
    this.open('errorDialog', options, onOpen, onClose)
  }

  public ask(message: string, title: string, onOpen?: () => boolean | void, onClose?: (data: any) => boolean | void): void {
    const options = {
      title: title,
      message: message,
      hideClose: true
    }
    this.open('askDialog', options, onOpen, onClose)
  }
}
