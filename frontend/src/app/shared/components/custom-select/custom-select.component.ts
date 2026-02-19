import {
  Component,
  Input,
  ChangeDetectionStrategy,
  signal,
  computed,
  HostListener,
  output,
  inject,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-custom-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './custom-select.component.html',
  styleUrl: './custom-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: CustomSelectComponent,
      multi: true,
    },
  ],
})
export class CustomSelectComponent implements ControlValueAccessor {
  @Input() options: SelectOption[] = [];
  @Input() placeholder = 'Seleccionar...';
  @Input() set disabled(v: boolean) {
    this._disabled.set(!!v);
  }

  readonly valueChange = output<string>();

  protected readonly isOpen = signal(false);
  protected readonly _disabled = signal(false);
  protected value = signal<string>('');

  protected selectedLabel = computed(() => {
    const val = this.value();
    const opt = this.options.find((o) => o.value === val);
    return opt?.label ?? this.placeholder;
  });

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | null | undefined): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabled.set(isDisabled);
  }

  protected toggle(): void {
    if (this._disabled()) return;
    this.isOpen.update((v) => !v);
    if (this.isOpen()) this.onTouched();
  }

  protected select(value: string): void {
    this.value.set(value);
    this.onChange(value);
    this.valueChange.emit(value);
    this.isOpen.set(false);
  }

  protected isSelected(value: string): boolean {
    return this.value() === value;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-select')) {
      this.isOpen.set(false);
    }
  }
}
