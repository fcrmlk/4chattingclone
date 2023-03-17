import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationsetingsComponent } from './notificationsetings.component';

describe('NotificationsetingsComponent', () => {
  let component: NotificationsetingsComponent;
  let fixture: ComponentFixture<NotificationsetingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotificationsetingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationsetingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
