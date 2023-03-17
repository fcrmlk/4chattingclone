import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MychannelsComponent } from './mychannels.component';

describe('MychannelsComponent', () => {
  let component: MychannelsComponent;
  let fixture: ComponentFixture<MychannelsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MychannelsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MychannelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
