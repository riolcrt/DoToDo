import { Injectable } from '@angular/core';
import { regexes } from './regex';

@Injectable({
  providedIn: 'root'
})
export class DateService {
  timeEllapsedToString(timeElapsed: number): string {
    const seconds = timeElapsed / 1000;
    const minutes = seconds / 60;
    const hours = minutes / 60;
    const days = hours / 24;

    if (days > 1) {
      const hoursRest = (days - Math.floor(days)) * 24;
      return `${Math.floor(days)}d and ${Math.floor(hoursRest)}h`;
    } else if (hours > 1) {
      const minutesRest = (hours - Math.floor(hours)) * 60;
      return `${Math.floor(hours)}h and ${Math.floor(minutesRest)}m`;
    } else if (minutes > 1) {
      const minutesRest = (minutes - Math.floor(minutes));
      const secondsRest = minutesRest * 60;
      return `${Math.floor(minutes)}m and ${Math.ceil(secondsRest)}s`;
    } else {
      return `${Math.floor(seconds)}s`;
    }
  }

  stringTimeEllapsedToMilliseconds(timeEllapsed: string): number {
    return timeEllapsed.match(regexes.ellapsedString).map (x => {
      const number = parseInt(x.slice(0, -1), 10) * 1000;
      const magnitude = x[x.length - 1];

      switch (magnitude) {
        case 'd':
          return number * 86400;
        case 'h':
          return number * 3600;
        case 'm':
          return number * 60;
        case 's':
          return number;
      }
    }).reduce ((a, b) => {
      return a + b;
    });
  }
  toLocaleIsoString(date: Date): string {
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, -1);
  }
}
