import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockedchannelsComponent } from './blockedchannels.component';

describe('BlockedchannelsComponent', () => {
  let component: BlockedchannelsComponent;
  let fixture: ComponentFixture<BlockedchannelsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlockedchannelsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockedchannelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
