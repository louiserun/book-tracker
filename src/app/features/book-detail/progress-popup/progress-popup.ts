import { Component, output, signal } from '@angular/core';
import { ProgressEntry } from '../../../core/models/book';
import { Popup } from '../../../shared/popup/popup';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DatePicker } from '../../../shared/date-picker/date-picker';

@Component({
  selector: 'app-progress-popup',
  imports: [CommonModule, FormsModule, Popup, DatePicker],
  templateUrl: './progress-popup.html',
  styleUrl: './progress-popup.scss',
})
export class ProgressPopup {
  progressAdded = output<ProgressEntry>();
  closed = output<void>();

  type = signal<'percentage' | 'page'>('percentage');
  value = signal('');
  entryDate = signal(new Date());

  typeMenuOpen = signal(false);

  toggleTypeMenu() {
    this.typeMenuOpen.update((open) => !open);
  }

  chooseType(type: 'percentage' | 'page') {
    this.type.set(type);
    this.typeMenuOpen.set(false);
  }

  setType(type: 'percentage' | 'page') {
    this.type.set(type);
  }

  setDate(date: Date) {
    this.entryDate.set(date);
  }

  maxValue(): number | null {
    return this.type() === 'percentage' ? 100 : null;
  }

  save() {
    const raw = String(this.value()).trim();
    const num = Number(raw);
    if (!raw || isNaN(num) || num < 0) return;

    const entry: ProgressEntry =
      this.type() === 'percentage'
        ? { date: this.entryDate(), percentage: Math.min(num, 100) }
        : { date: this.entryDate(), page: num };

    this.progressAdded.emit(entry);
    this.value.set('');
  }

  close() {
    this.value.set('');
    this.closed.emit();
  }
}
