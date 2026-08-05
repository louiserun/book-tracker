import { Component, output, signal } from '@angular/core';
import { CommentEntry } from '../../../core/models/book';
import { Popup } from '../../../shared/popup/popup';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-comment-popup',
  imports: [CommonModule, FormsModule, Popup],
  templateUrl: './comment-popup.html',
  styleUrl: './comment-popup.scss',
})
export class CommentPopup {
  // Notifie le parent qu'un nouveau commentaire a été validé
  commentAdded = output<CommentEntry>();
  // Notifie le parent que le popup doit se fermer, sans rien ajouter
  closed = output<void>();

  today = new Date();
  text = signal('');

  save() {
    const value = String(this.text()).trim();
    if (!value) return;
    this.commentAdded.emit({ text: value, date: new Date() });
    this.text.set('');
  }

  close() {
    this.text.set('');
    this.closed.emit();
  }
}
