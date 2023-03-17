import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewhelptermsComponent } from './newhelpterms.component';

describe('NewhelptermsComponent', () => {
  let component: NewhelptermsComponent;
  let fixture: ComponentFixture<NewhelptermsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewhelptermsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewhelptermsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
