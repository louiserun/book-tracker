import { Component, input, output } from '@angular/core';
import { Popup } from '../../../shared/popup/popup';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-delete-confirm-popup',
  imports: [CommonModule, FormsModule, Popup],
  templateUrl: './delete-confirm-popup.html',
  styleUrl: './delete-confirm-popup.scss',
})
export class DeleteConfirmPopup {
  // Titre du livre, affiché dans le message d'avertissement
  bookTitle = input.required<string>();

  // Notifie le parent que la suppression est confirmée
  confirmed = output<void>();
  // Notifie le parent que le popup doit se fermer sans supprimer
  closed = output<void>();

  confirm() {
    this.confirmed.emit();
  }

  close() {
    this.closed.emit();
  }
}
