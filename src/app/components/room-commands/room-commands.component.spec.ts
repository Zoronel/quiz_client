import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomCommandsComponent } from './room-commands.component';

describe('RoomCommandsComponent', () => {
  let component: RoomCommandsComponent;
  let fixture: ComponentFixture<RoomCommandsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoomCommandsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomCommandsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
