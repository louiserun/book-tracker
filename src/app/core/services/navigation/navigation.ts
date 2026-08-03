import { Injectable, signal } from '@angular/core';
import { ReadingStatus } from '../../models/book';

export type Tab = 'library' | 'search';

interface NavState {
  tab: Tab;
  status: ReadingStatus;
  bookId: number | null;
}

@Injectable({ providedIn: 'root' })
export class Navigation {
  activeTab = signal<Tab>('library');
  activeStatus = signal<ReadingStatus>('to-read');
  selectedBookId = signal<number | null>(null);

  constructor() {
    // Fixe l'état de départ comme première entrée d'historique
    history.replaceState(this.snapshot(), '');

    // Déclenché par le bouton/geste retour natif ET par history.back() qu'on appelle nous-mêmes
    window.addEventListener('popstate', (event) => {
      const state = event.state as NavState | null;
      if (state) {
        this.activeTab.set(state.tab);
        this.activeStatus.set(state.status);
        this.selectedBookId.set(state.bookId);
      }
    });
  }

  private snapshot(): NavState {
    return {
      tab: this.activeTab(),
      status: this.activeStatus(),
      bookId: this.selectedBookId(),
    };
  }

  private push() {
    history.pushState(this.snapshot(), '');
  }

  setTab(tab: Tab) {
    this.activeTab.set(tab);
    this.selectedBookId.set(null);
    this.push();
  }

  setStatus(status: ReadingStatus) {
    this.activeStatus.set(status);
    this.push();
  }

  openBook(bookId: number) {
    this.selectedBookId.set(bookId);
    this.push();
  }

  // Ferme l'écran actuel EN dépilant l'historique — le popstate déclenché
  // restaure automatiquement l'état précédent. Utilisé aussi bien pour
  // le bouton "Retour" affiché dans l'app que, indirectement, pour le bouton natif.
  goBack() {
    history.back();
  }
}
