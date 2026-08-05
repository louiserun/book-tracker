import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-popup',
  imports: [],
  templateUrl: './popup.html',
  styleUrl: './popup.scss',
})
export class Popup {
  // Titre optionnel affiché en haut du popup
  title = input<string>('');

  // Notifie le parent que le popup doit se fermer (clic dehors, Échap, ou action interne)
  closed = output<void>();

  close() {
    this.closed.emit();
  }
}
