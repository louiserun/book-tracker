import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookLookup } from './book-lookup';

describe('BookLookup', () => {
  let component: BookLookup;
  let fixture: ComponentFixture<BookLookup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookLookup],
    }).compileComponents();

    fixture = TestBed.createComponent(BookLookup);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
