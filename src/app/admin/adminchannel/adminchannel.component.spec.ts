import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminchannelComponent } from './adminchannel.component';

describe('AdminchannelComponent', () => {
  let component: AdminchannelComponent;
  let fixture: ComponentFixture<AdminchannelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminchannelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminchannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
