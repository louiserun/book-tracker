import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

// Résultat brut d'un volume retourné par l'API Google Books.
// On ne type que les champs qui nous intéressent (l'API en renvoie beaucoup plus).
export interface GoogleBookResult {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    categories?: string[]; // correspond à nos "genres"
    imageLinks?: { thumbnail?: string };
    industryIdentifiers?: { type: string; identifier: string }[]; // contient l'ISBN
  };
}

@Injectable({ providedIn: 'root' })
export class BookSearch {
  // Endpoint public de l'API Google Books — pas de clé API nécessaire pour une recherche simple
  private apiUrl = 'https://www.googleapis.com/books/v1/volumes';
  private apiKey = 'AIzaSyAVHSJ4kjapR2fvG8r5aWHF4bsxFK95RA0';

  private http = inject(HttpClient);
  // Recherche des livres à partir d'une requête libre (titre, auteur ou ISBN).
  // encodeURIComponent évite les soucis avec les espaces/accents dans l'URL.
  search(query: string): Observable<GoogleBookResult[]> {
    return this.http
      .get<{ items?: GoogleBookResult[] }>(
        `${this.apiUrl}?q=${encodeURIComponent(query)}&key=${this.apiKey}`,
      )
      .pipe(
        // L'API renvoie { items: [...] }, ou rien du tout si aucun résultat (pas de "items").
        // Le "?? []" évite un crash si "items" est absent.
        map((res) => res.items ?? []),
      );
  }
}
