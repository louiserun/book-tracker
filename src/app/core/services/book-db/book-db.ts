import { Service } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { Book } from '../../models/book';

@Service()
export class BookDb extends Dexie {
  // Nom de la base IndexedDB créée dans le navigateur (visible dans les DevTools > Application > IndexedDB)
  books!: Table<Book, number>;

  // Déclare le schéma de la table "books" en version 1.
  // '++id' : clé primaire auto-incrémentée (Dexie gère la génération de l'id)
  // Les champs suivants (status, format, title, author, dateAdded) sont indexés :
  // ça permet des requêtes rapides avec .where('champ').equals(...) sans scanner toute la table.
  // Les champs non listés ici (comments, description, etc.) restent stockés
  // normalement, juste non indexés — donc pas de recherche rapide dessus, mais lisibles/modifiables.
  constructor() {
    super('BookTrackerDB');
    this.version(1).stores({
      books: '++id, status, format, title, author, dateAdded',
    });
  }

  // Récupère tous les livres ayant un statut donné (ex: 'to-read', 'reading', 'finished').
  // Utilise l'index 'status' déclaré ci-dessus, donc requête rapide même avec beaucoup de livres.
  getByStatus(status: string) {
    return this.books.where('status').equals(status).toArray();
  }

  // Ajoute un nouveau livre. Dexie génère automatiquement l'id (grâce à '++id')
  // et retourne une Promise résolue avec cet id une fois l'ajout terminé.
  addBook(book: Book) {
    return this.books.add(book);
  }

  // Met à jour partiellement un livre existant, identifié par son id.
  // Partial<Book> permet de ne passer que les champs à modifier,
  // sans devoir renvoyer l'objet Book complet.
  updateBook(id: number, changes: Partial<Book>) {
    return this.books.update(id, changes);
  }

  // Supprime un livre par son id.
  deleteBook(id: number) {
    return this.books.delete(id);
  }
}
