import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private modals: any[] = [];
  private dialogIsOpen: boolean = false

  public add(modal: any): void {
    // add modal to array of active modals
    this.modals.push(modal);
  }
  public remove(modal: any): void {
    const idx = this.modals.indexOf(modal)
    if (idx == -1) return
    this.modals.splice(idx, 1)
  }
  public open(dialogId: string, options: any, onOpen?: Function, onClose?: Function) {
    const thisDialog = this.modals.find(m => m.id == dialogId)
    thisDialog?.open(options, onOpen, onClose)
    if (thisDialog) this.dialogIsOpen = true
  }
}
