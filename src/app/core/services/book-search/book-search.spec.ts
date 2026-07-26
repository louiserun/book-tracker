import { TestBed } from '@angular/core/testing';

import { BookSearch, GoogleBookResult } from './book-search';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

describe('BookSearch', () => {
  let service: BookSearch;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(BookSearch);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Vérifie qu'aucune requête HTTP inattendue n'est restée en attente
    httpMock.verify();
  });

  it('should return search results', () => {
    let result: GoogleBookResult[] = [];
    service.search('Uprooted').subscribe((books) => (result = books));

    // Intercepte la requête HTTP réelle et simule une réponse
    const req = httpMock.expectOne((request) =>
      request.url.startsWith('https://www.googleapis.com/books/v1/volumes'),
    );
    req.flush({ items: [{ id: '1', volumeInfo: { title: 'Uprooted' } }] });

    expect(result.length).toBe(1);
    expect(result[0].volumeInfo.title).toBe('Uprooted');
  });
});
