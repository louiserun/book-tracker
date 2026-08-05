import { Component, inject, output, signal } from '@angular/core';
import { BookSearch, GoogleBookResult } from '../../../core/services/book-search/book-search';
import { BookDb } from '../../../core/services/book-db/book-db';
import { Book } from '../../../core/models/book';
import { FormsModule } from '@angular/forms';
import { ManualAddForm } from '../manual-add-form/manual-add-form';

@Component({
  selector: 'app-book-lookup',
  imports: [FormsModule, ManualAddForm],
  templateUrl: './book-lookup.html',
  styleUrl: './book-lookup.scss',
})
export class BookLookup {
  private searchService = inject(BookSearch);
  private bookDb = inject(BookDb);

  // Texte tapé dans le champ de recherche, lié via [(ngModel)]
  query = signal('');

  // Résultats retournés par l'API Google Books
  results = signal<GoogleBookResult[]>([]);

  // Indique si une recherche est en cours (pour afficher un état de chargement)
  loading = signal(false);

  // output() = équivalent moderne de @Output() : notifie le composant parent
  // qu'un livre vient d'être ajouté, pour qu'il puisse rafraîchir sa liste par exemple
  bookAdded = output<void>();

  error = signal<string | null>(null);

  manualFormOpen = signal(false);

  onManualBookAdded() {
    this.manualFormOpen.set(false);
  }

  search() {
    const q = this.query().trim();
    if (!q) return;

    this.loading.set(true);
    this.error.set(null);
    this.searchService.search(q).subscribe({
      next: (items) => {
        this.results.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Une erreur est survenue. Réessaie dans quelques instants.');
      },
    });
  }

  // Convertit un résultat Google Books en Book et l'enregistre dans IndexedDB.
  // Le format et le statut sont mis à des valeurs par défaut ('physique', 'to-read'),
  // modifiables ensuite depuis la fiche livre.
  async addToLibrary(result: GoogleBookResult) {
    const info = result.volumeInfo;

    const newBook: Book = {
      title: info.title,
      author: info.authors?.join(', ') ?? 'Auteur inconnu',
      description: info.description,
      genres: info.categories,
      coverUrl: info.imageLinks?.thumbnail,
      isbn: info.industryIdentifiers?.find((i) => i.type.includes('ISBN'))?.identifier,
      pageCount: info.pageCount,
      format: 'physique',
      status: 'to-read',
      dateAdded: new Date(),
    };

    await this.bookDb.addBook(newBook);
    this.bookAdded.emit();

    // Retire le livre ajouté de la liste des résultats pour éviter un double-ajout accidentel
    this.results.update((list) => list.filter((r) => r.id !== result.id));
  }
}
