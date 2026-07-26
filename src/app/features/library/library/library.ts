import { Component, computed, inject, signal } from '@angular/core';
import { BookDb } from '../../../core/services/book-db/book-db';
import { Book, ReadingStatus } from '../../../core/models/book';

@Component({
  selector: 'app-library',
  imports: [],
  templateUrl: './library.html',
  styleUrl: './library.scss',
})
export class Library {
  // Injection moderne (Angular 14+), équivalent à un constructor(private bookDb: BookDbService)
  private bookDb = inject(BookDb);

  // signal() = état réactif Angular : quand sa valeur change, le template se met à jour automatiquement
  books = signal<Book[]>([]);
  activeStatus = signal<ReadingStatus>('to-read');

  // computed() = valeur dérivée, recalculée automatiquement quand "books" ou "activeStatus" changent
  filteredBooks = computed(() => this.books().filter((b) => b.status === this.activeStatus()));

  constructor() {
    this.loadBooks();
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

  // Calcule le nombre de jours depuis l'ajout — utile pour repérer les livres qui traînent dans la PAL
  daysSinceAdded(book: Book): number {
    const diff = Date.now() - new Date(book.dateAdded).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
}
