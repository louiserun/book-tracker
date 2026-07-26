export type ReadingStatus = 'to-read' | 'reading' | 'finished';
export type BookFormat = 'physique' | 'liseuse';

export interface Book {
  id?: number;
  isbn?: string;
  title: string;
  author: string;
  coverUrl?: string;
  description?: string;
  genres?: string[];
  format: BookFormat;
  status: ReadingStatus;
  rating?: number;
  comments?: string;
  dateAdded: Date;
  dateStarted?: Date;
  dateFinished?: Date;
}
