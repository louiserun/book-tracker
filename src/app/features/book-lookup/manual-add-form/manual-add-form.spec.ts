import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualAddForm } from './manual-add-form';

describe('ManualAddForm', () => {
  let component: ManualAddForm;
  let fixture: ComponentFixture<ManualAddForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManualAddForm],
    }).compileComponents();

    fixture = TestBed.createComponent(ManualAddForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
