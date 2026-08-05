export type ReadingStatus = 'to-read' | 'reading' | 'finished';
export type BookFormat = 'physique' | 'liseuse';

export interface CommentEntry {
  text: string;
  date: Date;
}

export interface ProgressEntry {
  date: Date;
  percentage?: number;
  page?: number;
}

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
  comments?: CommentEntry[];
  pageCount?: number;
  progress?: ProgressEntry[];
  dateAdded: Date;
  dateStarted?: Date;
  dateFinished?: Date;
}
