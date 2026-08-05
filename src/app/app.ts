import { Component, inject } from '@angular/core';
import { Library } from './features/library/library/library';
import { BookLookup } from './features/book-lookup/book-lookup/book-lookup';
import { Navigation } from './core/services/navigation/navigation';
import { Stats } from './features/stats/stats/stats';

@Component({
  selector: 'app-root',
  imports: [Library, BookLookup, Stats],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  nav = inject(Navigation);

  setTab(tab: 'library' | 'search' | 'stats') {
    this.nav.setTab(tab);
  }
}
