import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, retry, timer } from 'rxjs';

// Résultat brut d'un volume retourné par l'API Google Books.
// On ne type que les champs qui nous intéressent (l'API en renvoie beaucoup plus).
export interface GoogleBookResult {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    categories?: string[];
    pageCount?: number;
    imageLinks?: { thumbnail?: string };
    industryIdentifiers?: { type: string; identifier: string }[];
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
        // Réessaie jusqu'à 2 fois en cas d'échec, avec un délai croissant (1s, puis 2s)
        retry({ count: 2, delay: (_, retryCount) => timer(retryCount * 1000) }),
        map((res) => res.items ?? []),
      );
  }
}
