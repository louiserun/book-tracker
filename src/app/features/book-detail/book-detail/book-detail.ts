import { Component, inject, input, output, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BookDb } from '../../../core/services/book-db/book-db';
import { Book, BookFormat, CommentEntry, ReadingStatus } from '../../../core/models/book';

@Component({
  selector: 'app-book-detail',
  imports: [FormsModule, CommonModule],
  templateUrl: './book-detail.html',
  styleUrl: './book-detail.scss',
})
export class BookDetail implements OnInit {
  private bookDb = inject(BookDb);

  today = new Date();

  // Liste de genres courants proposés par défaut, même si la bibliothèque
  // ne contient pas encore de livre dans ces catégories.
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

  editMode = signal(false);

  enterEditMode() {
    this.editMode.set(true);
  }

  // Contrôle l'ouverture du popup d'ajout de commentaire
  commentPopupOpen = signal(false);

  // Texte en cours de saisie dans le popup (distinct du draft, pour ne l'ajouter
  // qu'au moment de la validation, pas à chaque frappe)
  newCommentText = signal('');

  // Tous les genres déjà utilisés dans la bibliothèque, sans doublons, triés
  availableGenres = signal<string[]>([]);

  // Texte du champ "ajouter un nouveau genre"
  newGenreText = signal('');

  private async loadAvailableGenres() {
    const allBooks = await this.bookDb.books.toArray();
    const fromLibrary = allBooks.flatMap((b) => b.genres ?? []);
    const merged = [...this.baseGenres, ...fromLibrary];
    this.availableGenres.set([...new Set(merged)].sort());
  }
  isGenreSelected(genre: string): boolean {
    return this.draft()?.genres?.includes(genre) ?? false;
  }

  toggleGenre(genre: string) {
    this.draft.update((b) => {
      if (!b) return b;
      const current = b.genres ?? [];
      const genres = current.includes(genre)
        ? current.filter((g) => g !== genre)
        : [...current, genre];
      return { ...b, genres };
    });
  }

  addNewGenre() {
    const genre = this.newGenreText().trim();
    if (!genre) return;

    // Ajoute le genre à la liste globale s'il n'existe pas encore, et le sélectionne directement
    if (!this.availableGenres().includes(genre)) {
      this.availableGenres.update((list) => [...list, genre].sort());
    }
    this.toggleGenre(genre);
    this.newGenreText.set('');
  }

  openCommentPopup() {
    this.newCommentText.set('');
    this.commentPopupOpen.set(true);
  }

  closeCommentPopup() {
    this.commentPopupOpen.set(false);
  }

  saveComment() {
    const text = this.newCommentText().trim();
    if (!text) return;

    const entry: CommentEntry = { text, date: new Date() };
    this.draft.update((b) => {
      if (!b) return b;
      const comments = [...(b.comments ?? []), entry];
      return { ...b, comments };
    });

    this.commentPopupOpen.set(false);
  }

  cancelEdit() {
    // Annule les modifications non enregistrées en revenant au livre d'origine
    this.draft.set({ ...this.book() });
    this.editMode.set(false);
  }

  ngOnInit() {
    this.draft.set({ ...this.book() });
    this.loadAvailableGenres();
  }

  updateField<K extends keyof Book>(field: K, value: Book[K]) {
    this.draft.update((b) => (b ? { ...b, [field]: value } : b));
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
    this.editMode.set(false);
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
