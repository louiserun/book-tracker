import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentPopup } from './comment-popup';

describe('CommentPopup', () => {
  let component: CommentPopup;
  let fixture: ComponentFixture<CommentPopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentPopup],
    }).compileComponents();

    fixture = TestBed.createComponent(CommentPopup);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
