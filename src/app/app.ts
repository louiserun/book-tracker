import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Library } from './features/library/library/library';
import { BookLookup } from './features/book-lookup/book-lookup/book-lookup';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Library, BookLookup],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('book-tracker');
}
