import { Component, computed, inject, input, output, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BookDb } from '../../../core/services/book-db/book-db';
import { Book, BookFormat, ReadingStatus } from '../../../core/models/book';

@Component({
  selector: 'app-book-detail',
  imports: [FormsModule, CommonModule],
  templateUrl: './book-detail.html',
  styleUrl: './book-detail.scss',
})
export class BookDetail implements OnInit {
  private bookDb = inject(BookDb);

  // input() = équivalent moderne de @Input() : le livre à afficher/éditer,
  // transmis par le composant parent (ex: Library, quand on clique sur une carte)
  book = input.required<Book>();

  // Notifie le parent que la fiche a été fermée (pour revenir à la liste)
  closed = output<void>();

  // Copie locale éditable du livre : on ne modifie jamais "book" directement
  // (c'est un input en lecture seule), on travaille sur ce signal, puis on sauvegarde.
  // Initialisé à undefined ici, puis rempli dans ngOnInit — un input.required()
  // ne peut être lu ni dans un initialiseur de champ ni dans le constructeur,
  // seulement une fois qu'Angular a fini de lier les inputs (donc dans ngOnInit).
  draft = signal<Book | undefined>(undefined);

  genresText = computed(() => this.draft()?.genres?.join(', ') ?? '');

  ngOnInit() {
    this.draft.set({ ...this.book() });
  }

  updateField<K extends keyof Book>(field: K, value: Book[K]) {
    this.draft.update((b) => (b ? { ...b, [field]: value } : b));
  }

  updateGenres(text: string) {
    const genres = text
      .split(',')
      .map((g) => g.trim())
      .filter((g) => g.length > 0);
    this.updateField('genres', genres);
  }

  setStatus(status: ReadingStatus) {
    this.draft.update((b) => {
      if (!b) return b;
      const changes: Partial<Book> = { status };
      // Renseigne automatiquement les dates de suivi quand le statut change,
      // sans écraser une date déjà existante si l'utilisateur revient en arrière.
      if (status === 'reading' && !b.dateStarted) {
        changes.dateStarted = new Date();
      }
      if (status === 'finished' && !b.dateFinished) {
        changes.dateFinished = new Date();
      }
      return { ...b, ...changes };
    });
  }

  setFormat(format: BookFormat) {
    this.updateField('format', format);
  }

  setRating(rating: number) {
    this.updateField('rating', rating);
  }

  async save() {
    const current = this.draft();
    if (current && current.id !== undefined) {
      await this.bookDb.updateBook(current.id, current);
    }
    this.closed.emit();
  }

  async remove() {
    const current = this.draft();
    if (current && current.id !== undefined) {
      await this.bookDb.deleteBook(current.id);
    }
    this.closed.emit();
  }

  cancel() {
    this.closed.emit();
  }
}
