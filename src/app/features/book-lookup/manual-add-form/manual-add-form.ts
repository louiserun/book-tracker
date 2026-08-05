import { Component, inject, output, signal } from '@angular/core';
import { BookDb } from '../../../core/services/book-db/book-db';
import { Book, BookFormat } from '../../../core/models/book';
import { FormsModule } from '@angular/forms';
import { Popup } from '../../../shared/popup/popup';

@Component({
  selector: 'app-manual-add-form',
  imports: [FormsModule, Popup],
  templateUrl: './manual-add-form.html',
  styleUrl: './manual-add-form.scss',
})
export class ManualAddForm {
  private bookDb = inject(BookDb);

  bookAdded = output<void>();
  closed = output<void>();

  title = signal('');
  author = signal('');
  format = signal<BookFormat>('physique');
  pageCount = signal('');
  coverUrl = signal('');
  description = signal('');
  genres = signal<string[]>([]);

  error = signal<string | null>(null);

  private readonly baseGenres = [
    'Fantasy',
    'Science-fiction',
    'Romance',
    'Thriller',
    'Policier',
    'Horreur',
    'Historique',
    'Young Adult',
    'Contemporain',
    'Classique',
    'Biographie',
    'Développement personnel',
    'Poésie',
    'BD / Manga',
  ];

  availableGenres = signal<string[]>([]);
  newGenreText = signal('');

  constructor() {
    this.loadAvailableGenres();
  }

  private async loadAvailableGenres() {
    const allBooks = await this.bookDb.books.toArray();
    const fromLibrary = allBooks.flatMap((b) => b.genres ?? []);
    const merged = [...this.baseGenres, ...fromLibrary];
    this.availableGenres.set([...new Set(merged)].sort());
  }

  isGenreSelected(genre: string): boolean {
    return this.genres().includes(genre);
  }

  toggleGenre(genre: string) {
    this.genres.update((current) =>
      current.includes(genre) ? current.filter((g) => g !== genre) : [...current, genre],
    );
  }

  addNewGenre() {
    const genre = this.newGenreText().trim();
    if (!genre) return;
    if (!this.availableGenres().includes(genre)) {
      this.availableGenres.update((list) => [...list, genre].sort());
    }
    this.toggleGenre(genre);
    this.newGenreText.set('');
  }

  setFormat(format: BookFormat) {
    this.format.set(format);
  }

  async save() {
    const title = this.title().trim();
    const author = this.author().trim();

    if (!title || !author) {
      this.error.set('Le titre et l’auteur sont obligatoires.');
      return;
    }

    const newBook: Book = {
      title,
      author,
      format: this.format(),
      status: 'to-read',
      dateAdded: new Date(),
      pageCount: this.pageCount() ? Number(this.pageCount()) : undefined,
      coverUrl: this.coverUrl().trim() || undefined,
      description: this.description().trim() || undefined,
      genres: this.genres().length ? this.genres() : undefined,
    };

    await this.bookDb.addBook(newBook);
    this.bookAdded.emit();
    this.reset();
  }

  private reset() {
    this.title.set('');
    this.author.set('');
    this.format.set('physique');
    this.pageCount.set('');
    this.coverUrl.set('');
    this.description.set('');
    this.genres.set([]);
    this.error.set(null);
  }

  close() {
    this.reset();
    this.closed.emit();
  }
}
