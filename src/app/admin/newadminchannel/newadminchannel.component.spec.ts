import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewadminchannelComponent } from './newadminchannel.component';

describe('NewadminchannelComponent', () => {
  let component: NewadminchannelComponent;
  let fixture: ComponentFixture<NewadminchannelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewadminchannelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewadminchannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
