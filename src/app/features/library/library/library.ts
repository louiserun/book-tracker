import { Component, computed, inject, signal } from '@angular/core';
import { BookDb } from '../../../core/services/book-db/book-db';
import { Book, BookFormat, ReadingStatus } from '../../../core/models/book';
import { BookDetail } from '../../book-detail/book-detail/book-detail';
import { FormsModule } from '@angular/forms';

type SortOption = 'title' | 'author' | 'dateAdded' | 'rating';

@Component({
  selector: 'app-library',
  imports: [BookDetail, FormsModule],
  templateUrl: './library.html',
  styleUrl: './library.scss',
})
export class Library {
  // Injection moderne (Angular 14+), équivalent à un constructor(private bookDb: BookDbService)
  private bookDb = inject(BookDb);

  // signal() = état réactif Angular : quand sa valeur change, le template se met à jour automatiquement
  books = signal<Book[]>([]);
  activeStatus = signal<ReadingStatus>('to-read');

  // Livre actuellement sélectionné pour affichage dans BookDetail.
  // undefined = aucune fiche ouverte, on affiche la liste normale.
  selectedBook = signal<Book | undefined>(undefined);

  // Filtres additionnels : 'all' = pas de filtre appliqué sur ce critère
  formatFilter = signal<BookFormat | 'all'>('all');
  genreFilter = signal<string | 'all'>('all');
  sortBy = signal<SortOption>('dateAdded');

  // Liste de tous les genres présents dans la bibliothèque, sans doublons,
  // recalculée automatiquement quand "books" change — alimente le menu déroulant de filtre.
  availableGenres = computed(() => {
    const all = this.books().flatMap((b) => b.genres ?? []);
    return [...new Set(all)].sort();
  });

  // computed() = valeur dérivée, recalculée automatiquement quand "books" ou "activeStatus" changent
  filteredBooks = computed(() => {
    let result = this.books().filter((b) => b.status === this.activeStatus());

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
        // Les plus anciens d'abord — utile pour repérer les livres qui traînent dans la PAL
        return sorted.sort(
          (a, b) => new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime(),
        );
    }
  }

  // Charge tous les livres depuis IndexedDB et met à jour le signal
  private async loadBooks() {
    const all = await this.bookDb.books.toArray();
    this.books.set(all);
  }

  // Change l'onglet actif (à lire / en cours / terminé)
  setStatus(status: ReadingStatus) {
    this.activeStatus.set(status);
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

  // Calcule le nombre de jours depuis l'ajout — utile pour repérer les livres qui traînent dans la PAL
  daysSinceAdded(book: Book): number {
    const diff = Date.now() - new Date(book.dateAdded).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  // Ouvre la fiche détaillée d'un livre
  openBook(book: Book) {
    this.selectedBook.set(book);
  }

  // Ferme la fiche et recharge la liste (au cas où le livre a été modifié ou supprimé)
  onDetailClosed() {
    this.selectedBook.set(undefined);
    this.loadBooks();
  }
}
