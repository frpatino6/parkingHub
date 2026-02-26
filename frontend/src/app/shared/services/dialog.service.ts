import { Injectable, signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface DialogConfig {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

@Injectable({ providedIn: 'root' })
export class DialogService {
  private _config = signal<DialogConfig | null>(null);
  readonly config = this._config.asReadonly();

  private _subject: Subject<boolean> | null = null;

  confirm(options: DialogConfig): Observable<boolean> {
    this._config.set(options);
    this._subject = new Subject<boolean>();
    return this._subject.asObservable();
  }

  resolve(confirmed: boolean): void {
    this._config.set(null);
    if (this._subject) {
      this._subject.next(confirmed);
      this._subject.complete();
      this._subject = null;
    }
  }
}
