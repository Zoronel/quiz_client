import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { RoomService } from 'src/app/services/room.service';
import { PlayerService } from 'src/app/services/player.service';

@Component({
  selector: 'app-newroom',
  templateUrl: './newroom.component.html',
  styleUrls: ['./newroom.component.scss']
})
export class NewroomComponent implements OnInit {

  constructor(
    private roomService: RoomService,
    private playerService: PlayerService
  ) { }

  ngOnInit(): void {
    console.log('New room form ready')
  }
  public onSubmit(f: NgForm) {
    if (f.valid)
      this.roomService.newRoom(f.value.roomName, f.value.roomQuestion, this.playerService.myId)
  }

}
