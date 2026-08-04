import { CommonModule } from '@angular/common';
import { Component, computed, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-date-picker',
  imports: [CommonModule],
  templateUrl: './date-picker.html',
  styleUrl: './date-picker.scss',
})
export class DatePicker {
  // Date actuellement sélectionnée, transmise par le composant parent
  selectedDate = input<Date | undefined>(undefined);

  // Notifie le parent qu'une nouvelle date a été choisie
  dateSelected = output<Date>();

  // Libellé affiché sur le bouton déclencheur (ex: "Ajouté le")
  label = input<string>('Date');

  popupOpen = signal(false);
  calendarMonth = signal(new Date());

  monthLabel = computed(() =>
    this.calendarMonth().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
  );

  calendarDays = computed(() => {
    const month = this.calendarMonth();
    const year = month.getFullYear();
    const m = month.getMonth();
    const firstDay = new Date(year, m, 1);
    const daysInMonth = new Date(year, m + 1, 0).getDate();
    const startOffset = (firstDay.getDay() + 6) % 7;

    const days: (Date | null)[] = Array(startOffset).fill(null);
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(new Date(year, m, d));
    }
    return days;
  });

  weekdayLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  open() {
    this.calendarMonth.set(this.selectedDate() ? new Date(this.selectedDate()!) : new Date());
    this.popupOpen.set(true);
  }

  close() {
    this.popupOpen.set(false);
  }

  previousMonth() {
    const m = this.calendarMonth();
    this.calendarMonth.set(new Date(m.getFullYear(), m.getMonth() - 1, 1));
  }

  nextMonth() {
    const m = this.calendarMonth();
    this.calendarMonth.set(new Date(m.getFullYear(), m.getMonth() + 1, 1));
  }

  isSelectedDay(day: Date): boolean {
    const current = this.selectedDate();
    if (!current) return false;
    const c = new Date(current);
    return (
      c.getFullYear() === day.getFullYear() &&
      c.getMonth() === day.getMonth() &&
      c.getDate() === day.getDate()
    );
  }

  selectDate(day: Date) {
    this.dateSelected.emit(day);
    this.popupOpen.set(false);
  }
}
