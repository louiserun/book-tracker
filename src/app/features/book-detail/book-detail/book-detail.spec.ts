import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookDetail } from './book-detail';
import { Book } from '../../../core/models/book';
import { BookDb } from '../../../core/services/book-db/book-db';

describe('BookDetail', () => {
  let component!: BookDetail;
  let fixture!: ComponentFixture<BookDetail>;

  const testBook: Book = {
    id: 1,
    title: 'Uprooted',
    author: 'Naomi Novik',
    format: 'liseuse',
    status: 'to-read',
    dateAdded: new Date('2026-01-01'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(BookDetail);
    component = fixture.componentInstance;

    // Fournit la valeur de l'input requis "book" avant le premier detectChanges,
    // sinon Angular lève une erreur (input.required non renseigné).
    fixture.componentRef.setInput('book', testBook);

    fixture.detectChanges(); // déclenche ngOnInit, qui initialise "draft"
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize draft from the book input', () => {
    expect(component.draft()?.title).toBe('Uprooted');
    expect(component.draft()?.author).toBe('Naomi Novik');
  });

  it('should update a field without mutating the original input', () => {
    component.updateField('title', 'Uprooted (updated)');

    expect(component.draft()?.title).toBe('Uprooted (updated)');
    // Le livre transmis en input ne doit jamais être modifié directement
    expect(component.book().title).toBe('Uprooted');
  });

  it('should parse comma-separated genres text into an array', () => {
    component.updateGenres('Fantasy, Romance,  Aventure ');

    expect(component.draft()?.genres).toEqual(['Fantasy', 'Romance', 'Aventure']);
  });

  it('should set dateStarted when status changes to reading', () => {
    expect(component.draft()?.dateStarted).toBeUndefined();

    component.setStatus('reading');

    expect(component.draft()?.status).toBe('reading');
    expect(component.draft()?.dateStarted).toBeInstanceOf(Date);
  });

  it('should not overwrite an existing dateStarted', () => {
    const existingDate = new Date('2025-06-01');
    component.updateField('dateStarted', existingDate);

    component.setStatus('reading');

    expect(component.draft()?.dateStarted).toEqual(existingDate);
  });

  it('should call bookDb.updateBook and emit closed on save', async () => {
    const bookDb = TestBed.inject(BookDb);
    const updateSpy = vi.spyOn(bookDb, 'updateBook').mockResolvedValue(1);
    const closedSpy = vi.fn();
    component.closed.subscribe(closedSpy);

    await component.save();

    expect(updateSpy).toHaveBeenCalledWith(1, expect.objectContaining({ title: 'Uprooted' }));
    expect(closedSpy).toHaveBeenCalled();
  });

  it('should call bookDb.deleteBook and emit closed on remove', async () => {
    const bookDb = TestBed.inject(BookDb);
    const deleteSpy = vi.spyOn(bookDb, 'deleteBook').mockResolvedValue(undefined);
    const closedSpy = vi.fn();
    component.closed.subscribe(closedSpy);

    await component.remove();

    expect(deleteSpy).toHaveBeenCalledWith(1);
    expect(closedSpy).toHaveBeenCalled();
  });
});
