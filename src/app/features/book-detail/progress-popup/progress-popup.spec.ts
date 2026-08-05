import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressPopup } from './progress-popup';

describe('ProgressPopup', () => {
  let component: ProgressPopup;
  let fixture: ComponentFixture<ProgressPopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressPopup],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgressPopup);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
