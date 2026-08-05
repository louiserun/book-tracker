import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteConfirmPopup } from './delete-confirm-popup';

describe('DeleteConfirmPopup', () => {
  let component: DeleteConfirmPopup;
  let fixture: ComponentFixture<DeleteConfirmPopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteConfirmPopup],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteConfirmPopup);
    component = fixture.componentInstance;

    // Fournit la valeur de l'input requis avant le premier detectChanges
    fixture.componentRef.setInput('bookTitle', 'Un livre test');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
