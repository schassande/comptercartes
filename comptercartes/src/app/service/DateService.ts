import { Injectable } from '@angular/core';

const DATE_SEP = '-';
const TIME_SLOT_SEP = ':';

@Injectable()
export class DateService {

    public compareDate(day1: Date, day2: Date): number {
        // Compare date
        let res: number = day1.getFullYear() - day2.getFullYear();
        if (res === 0) {
          res = day1.getMonth() - day2.getMonth();
          if (res === 0) {
            res = day1.getDate() - day2.getDate();
          }
        }
        return res;
      }

    public date2string(aDate: Date): string {
        return aDate.getFullYear()
          + DATE_SEP + this.to2Digit(aDate.getMonth() + 1)
          + DATE_SEP + this.to2Digit(aDate.getDate());
    }

    public string2date(dateStr: string, aDate: Date): Date {
        const elements = dateStr.split(DATE_SEP);
        if (!aDate) {
            aDate = new Date();
        }
        aDate.setFullYear(Number.parseInt(elements[0], 0));
        aDate.setMonth(Number.parseInt(elements[1], 0) - 1);
        aDate.setDate(Number.parseInt(elements[2], 0));
        return aDate;
    }
    public time2string(ts: Date): string {
      return this.to2Digit(ts.getHours()) + TIME_SLOT_SEP + this.to2Digit(ts.getMinutes());
    }

    public datetime2string(d: Date): string {
      return this.date2string(d) + ' ' + this.time2string(d);
    }

    public to2Digit(nb: number): string {
        return (nb < 10 ? '0' : '') + nb;
    }
}
