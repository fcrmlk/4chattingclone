import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EdithelptermsComponent } from './edithelpterms.component';

describe('EdithelptermsComponent', () => {
  let component: EdithelptermsComponent;
  let fixture: ComponentFixture<EdithelptermsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EdithelptermsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EdithelptermsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
