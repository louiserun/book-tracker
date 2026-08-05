import { Component, computed, inject, signal } from '@angular/core';
import { Book } from '../../../core/models/book';
import { BookDb } from '../../../core/services/book-db/book-db';

interface MonthCount {
  label: string;
  count: number;
}

@Component({
  selector: 'app-stats',
  imports: [],
  templateUrl: './stats.html',
  styleUrl: './stats.scss',
})
export class Stats {
  private bookDb = inject(BookDb);

  books = signal<Book[]>([]);

  constructor() {
    this.loadBooks();
  }

  private async loadBooks() {
    const all = await this.bookDb.books.toArray();
    this.books.set(all);
  }

  // --- Vue d'ensemble ---

  totalToRead = computed(() => this.books().filter((b) => b.status === 'to-read').length);
  totalReading = computed(() => this.books().filter((b) => b.status === 'reading').length);
  totalFinished = computed(() => this.books().filter((b) => b.status === 'finished').length);

  finishedThisYear = computed(() => {
    const currentYear = new Date().getFullYear();
    return this.books().filter(
      (b) =>
        b.status === 'finished' &&
        b.dateFinished &&
        new Date(b.dateFinished).getFullYear() === currentYear,
    ).length;
  });

  finishedThisMonth = computed(() => {
    const now = new Date();
    return this.books().filter((b) => {
      if (b.status !== 'finished' || !b.dateFinished) return false;
      const d = new Date(b.dateFinished);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;
  });

  totalPagesRead = computed(() =>
    this.books()
      .filter((b) => b.status === 'finished')
      .reduce((sum, b) => sum + (b.pageCount ?? 0), 0),
  );

  // --- Rythme de lecture ---

  private finishedWithDuration = computed(() =>
    this.books().filter((b) => b.status === 'finished' && b.dateStarted && b.dateFinished),
  );

  private daysBetween(a: Date, b: Date): number {
    return Math.round((new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24));
  }

  averageReadingDays = computed(() => {
    const list = this.finishedWithDuration();
    if (!list.length) return null;
    const total = list.reduce(
      (sum, b) => sum + this.daysBetween(b.dateStarted!, b.dateFinished!),
      0,
    );
    return Math.round(total / list.length);
  });

  fastestBook = computed(() => {
    const list = this.finishedWithDuration();
    if (!list.length) return null;
    return list.reduce((min, b) =>
      this.daysBetween(b.dateStarted!, b.dateFinished!) <
      this.daysBetween(min.dateStarted!, min.dateFinished!)
        ? b
        : min,
    );
  });

  slowestBook = computed(() => {
    const list = this.finishedWithDuration();
    if (!list.length) return null;
    return list.reduce((max, b) =>
      this.daysBetween(b.dateStarted!, b.dateFinished!) >
      this.daysBetween(max.dateStarted!, max.dateFinished!)
        ? b
        : max,
    );
  });

  bookDuration(book: Book): number {
    if (!book.dateStarted || !book.dateFinished) return 0;
    return this.daysBetween(book.dateStarted, book.dateFinished);
  }

  // Nombre de livres terminés par mois, sur les 6 derniers mois
  monthlyFinished = computed<MonthCount[]>(() => {
    const now = new Date();
    const months: MonthCount[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString('fr-FR', { month: 'short' });
      const count = this.books().filter((b) => {
        if (b.status !== 'finished' || !b.dateFinished) return false;
        const fd = new Date(b.dateFinished);
        return fd.getFullYear() === d.getFullYear() && fd.getMonth() === d.getMonth();
      }).length;
      months.push({ label, count });
    }
    return months;
  });

  maxMonthlyCount = computed(() => Math.max(1, ...this.monthlyFinished().map((m) => m.count)));

  // --- Goûts et préférences ---

  topGenre = computed(() => {
    const finished = this.books().filter((b) => b.status === 'finished');
    const counts = new Map<string, number>();
    finished.forEach((b) => b.genres?.forEach((g) => counts.set(g, (counts.get(g) ?? 0) + 1)));
    if (!counts.size) return null;
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  });

  averageRating = computed(() => {
    const rated = this.books().filter((b) => b.rating);
    if (!rated.length) return null;
    const total = rated.reduce((sum, b) => sum + (b.rating ?? 0), 0);
    return (total / rated.length).toFixed(1);
  });

  formatSplit = computed(() => {
    const all = this.books();
    const physique = all.filter((b) => b.format === 'physique').length;
    const liseuse = all.filter((b) => b.format === 'liseuse').length;
    const total = physique + liseuse;
    return {
      physique,
      liseuse,
      physiquePercent: total ? Math.round((physique / total) * 100) : 0,
      liseusePercent: total ? Math.round((liseuse / total) * 100) : 0,
    };
  });

  topAuthor = computed(() => {
    const counts = new Map<string, number>();
    this.books().forEach((b) => counts.set(b.author, (counts.get(b.author) ?? 0) + 1));
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    return sorted.length && sorted[0][1] > 1 ? sorted[0] : null;
  });

  // --- PAL ---

  oldestPalBook = computed(() => {
    const toRead = this.books().filter((b) => b.status === 'to-read');
    if (!toRead.length) return null;
    return toRead.reduce((oldest, b) =>
      new Date(b.dateAdded) < new Date(oldest.dateAdded) ? b : oldest,
    );
  });

  daysSinceAdded(book: Book): number {
    return this.daysBetween(book.dateAdded, new Date());
  }

  averagePalAge = computed(() => {
    const toRead = this.books().filter((b) => b.status === 'to-read');
    if (!toRead.length) return null;
    const total = toRead.reduce((sum, b) => sum + this.daysSinceAdded(b), 0);
    return Math.round(total / toRead.length);
  });

  addedThisMonth = computed(() => {
    const now = new Date();
    return this.books().filter((b) => {
      const d = new Date(b.dateAdded);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;
  });
}
