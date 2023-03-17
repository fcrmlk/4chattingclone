import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HelptermsComponent } from './helpterms.component';

describe('HelptermsComponent', () => {
  let component: HelptermsComponent;
  let fixture: ComponentFixture<HelptermsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HelptermsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HelptermsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
