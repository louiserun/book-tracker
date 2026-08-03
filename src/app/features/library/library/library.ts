import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BookDb } from '../../../core/services/book-db/book-db';
import { Navigation } from '../../../core/services/navigation/navigation';
import { Book, BookFormat, ReadingStatus } from '../../../core/models/book';
import { BookDetail } from '../../book-detail/book-detail/book-detail';

type SortOption = 'title' | 'author' | 'dateAdded' | 'rating';

@Component({
  selector: 'app-library',
  imports: [BookDetail, FormsModule],
  templateUrl: './library.html',
  styleUrl: './library.scss',
})
export class Library {
  private bookDb = inject(BookDb);
  nav = inject(Navigation);

  sortOptions: SortOption[] = ['dateAdded', 'title', 'author', 'rating'];

  books = signal<Book[]>([]);

  // Retrouve l'objet livre complet à partir de l'id stocké dans NavigationService
  selectedBook = computed(() => {
    const id = this.nav.selectedBookId();
    return id !== null ? this.books().find((b) => b.id === id) : undefined;
  });

  activeStatusIndex = computed(() => {
    const order: ReadingStatus[] = ['to-read', 'reading', 'finished'];
    return order.indexOf(this.nav.activeStatus());
  });

  formatFilter = signal<BookFormat | 'all'>('all');
  genreFilter = signal<string | 'all'>('all');
  sortBy = signal<SortOption>('dateAdded');

  filtersOpen = signal(false);
  sortMenuOpen = signal(false);

  sortLabels: Record<SortOption, string> = {
    dateAdded: "Date d'ajout",
    title: 'Titre',
    author: 'Auteur',
    rating: 'Note',
  };

  activeFilterCount = computed(() => {
    let count = 0;
    if (this.formatFilter() !== 'all') count++;
    if (this.genreFilter() !== 'all') count++;
    return count;
  });

  availableGenres = computed(() => {
    const all = this.books().flatMap((b) => b.genres ?? []);
    return [...new Set(all)].sort();
  });

  filteredBooks = computed(() => {
    let result = this.books().filter((b) => b.status === this.nav.activeStatus());

    const format = this.formatFilter();
    if (format !== 'all') {
      result = result.filter((b) => b.format === format);
    }

    const genre = this.genreFilter();
    if (genre !== 'all') {
      result = result.filter((b) => b.genres?.includes(genre));
    }

    return this.sortBooks(result);
  });

  constructor() {
    this.loadBooks();
  }

  private sortBooks(list: Book[]): Book[] {
    const sorted = [...list];
    switch (this.sortBy()) {
      case 'title':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'author':
        return sorted.sort((a, b) => a.author.localeCompare(b.author));
      case 'rating':
        return sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      case 'dateAdded':
      default:
        return sorted.sort(
          (a, b) => new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime(),
        );
    }
  }

  private async loadBooks() {
    const all = await this.bookDb.books.toArray();
    this.books.set(all);
  }

  setStatus(status: ReadingStatus) {
    this.nav.setStatus(status);
  }

  toggleSortMenu() {
    this.sortMenuOpen.update((open) => !open);
  }

  chooseSortBy(option: SortOption) {
    this.sortBy.set(option);
    this.sortMenuOpen.set(false);
  }

  toggleFilters() {
    this.filtersOpen.update((open) => !open);
  }

  setFormatFilter(format: BookFormat | 'all') {
    this.formatFilter.set(format);
  }

  setGenreFilter(genre: string) {
    this.genreFilter.set(genre);
  }

  setSortBy(sort: SortOption) {
    this.sortBy.set(sort);
  }

  daysSinceAdded(book: Book): number {
    const diff = Date.now() - new Date(book.dateAdded).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  openBook(book: Book) {
    if (book.id !== undefined) {
      this.nav.openBook(book.id);
    }
  }

  onDetailClosed() {
    this.loadBooks();
    this.nav.goBack();
  }

  // Ordre des statuts, utilisé pour naviguer avec le swipe (précédent/suivant)
  private statusOrder: ReadingStatus[] = ['to-read', 'reading', 'finished'];

  private touchStartX = 0;

  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.touches[0].clientX;
  }

  onTouchEnd(event: TouchEvent) {
    const touchEndX = event.changedTouches[0].clientX;
    const delta = touchEndX - this.touchStartX;
    const threshold = 50;

    if (Math.abs(delta) < threshold) return;

    const currentIndex = this.statusOrder.indexOf(this.nav.activeStatus());

    if (delta < 0 && currentIndex < this.statusOrder.length - 1) {
      this.setStatus(this.statusOrder[currentIndex + 1]);
    } else if (delta > 0 && currentIndex > 0) {
      this.setStatus(this.statusOrder[currentIndex - 1]);
    }
  }
}
