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
  @Input() multiple = false;
  @Input() set disabled(v: boolean) {
    this._disabled.set(!!v);
  }

  readonly valueChange = output<any>();

  protected readonly isOpen = signal(false);
  protected readonly _disabled = signal(false);
  protected value = signal<any>('');

  protected selectedLabel = computed(() => {
    const val = this.value();
    if (this.multiple && Array.isArray(val)) {
      if (val.length === 0) return this.placeholder;
      if (val.length === 1) {
        return this.options.find(o => o.value === val[0])?.label ?? val[0];
      }
      return `${val.length} seleccionados`;
    }
    const opt = this.options.find((o) => o.value === val);
    return opt?.label ?? this.placeholder;
  });

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: any): void {
    if (this.multiple) {
      this.value.set(Array.isArray(value) ? value : []);
    } else {
      this.value.set(value ?? '');
    }
  }

  registerOnChange(fn: (value: any) => void): void {
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
    if (this.multiple) {
      let currentValues = [...(this.value() as string[] || [])];
      const index = currentValues.indexOf(value);
      if (index >= 0) {
        currentValues.splice(index, 1);
      } else {
        currentValues.push(value);
      }
      this.value.set(currentValues);
      this.onChange(currentValues);
      this.valueChange.emit(currentValues);
    } else {
      this.value.set(value);
      this.onChange(value);
      this.valueChange.emit(value);
      this.isOpen.set(false);
    }
  }

  protected isSelected(value: string): boolean {
    const current = this.value();
    if (this.multiple && Array.isArray(current)) {
      return current.includes(value);
    }
    return current === value;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-select')) {
      this.isOpen.set(false);
    }
  }
}
