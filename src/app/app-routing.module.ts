import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RoomComponent } from './components/room/room.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { NewroomComponent } from './components/newroom/newroom.component';


const routes: Routes = [
  { path: 'welcome', component: WelcomeComponent },
  { path: 'room/:id', component: RoomComponent },
  { path: 'newroom', component: NewroomComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
