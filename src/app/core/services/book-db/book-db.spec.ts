import { TestBed } from '@angular/core/testing';

import { BookDb } from './book-db';

describe('BookDb', () => {
  let service: BookDb;

  beforeEach(async () => {
    // Récupère une instance du service via l'injecteur Angular de test
    TestBed.configureTestingModule({});
    service = TestBed.inject(BookDb);

    // Vide la table avant chaque test pour éviter que les tests
    // ne se polluent entre eux (chaque test doit partir d'un état propre)
    await service.books.clear();
  });

  it('should add and retrieve a book', async () => {
    // Ajoute un livre de test et récupère l'id généré
    await service.addBook({
      title: 'Uprooted',
      author: 'Naomi Novik',
      format: 'liseuse',
      status: 'to-read',
      dateAdded: new Date(),
    });

    // Vérifie qu'on retrouve bien ce livre via getByStatus
    const books = await service.getByStatus('to-read');
    expect(books.length).toBe(1);
    expect(books[0].title).toBe('Uprooted');
  });
});
