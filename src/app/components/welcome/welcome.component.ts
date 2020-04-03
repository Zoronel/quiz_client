import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { PlayerService } from 'src/app/services/player.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {

  constructor(
    private currentPlayer: PlayerService
  ) { }

  ngOnInit(): void {
    console.log('Welcome Ready')
  }

  public onSubmit(f: NgForm) {
    this.currentPlayer.connect(f.value.userName, PlayerService.ROLE_PLAYER)
  }

}
