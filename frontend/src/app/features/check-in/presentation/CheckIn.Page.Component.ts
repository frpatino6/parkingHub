import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { CheckInBloc } from '../application/CheckIn.Bloc';
import { VehicleType } from '../../../core/domain/enums/VehicleType.enum';

@Component({
  selector: 'app-check-in-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [CheckInBloc],
  templateUrl: './CheckIn.Page.Component.html',
  styleUrl: './CheckIn.Page.Component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckInPageComponent {
  readonly bloc = inject(CheckInBloc);
  private readonly fb = inject(FormBuilder);

  readonly VehicleType = VehicleType;
  readonly vehicleTypeOptions: { value: VehicleType; label: string }[] = [
    { value: VehicleType.CAR, label: 'Carro' },
    { value: VehicleType.MOTORCYCLE, label: 'Moto' },
    { value: VehicleType.BICYCLE, label: 'Bicicleta' },
  ];

  readonly form = this.fb.nonNullable.group({
    plate: ['', [Validators.required, Validators.maxLength(10)]],
    vehicleType: [VehicleType.CAR, Validators.required],
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    const { plate, vehicleType } = this.form.getRawValue();
    this.bloc.submitCheckIn(plate, vehicleType);
  }

  onNewCheckIn(): void {
    this.bloc.reset();
    this.form.reset({ plate: '', vehicleType: VehicleType.CAR });
  }

  formatCheckInDate(iso: string): string {
    return new Date(iso).toLocaleString('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }
}
