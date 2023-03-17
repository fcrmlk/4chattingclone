import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserchannelsComponent } from './userchannels.component';

describe('UserchannelsComponent', () => {
  let component: UserchannelsComponent;
  let fixture: ComponentFixture<UserchannelsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserchannelsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserchannelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
