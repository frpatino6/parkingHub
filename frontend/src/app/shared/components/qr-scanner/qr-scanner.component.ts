import {
  Component, OnDestroy, Output, EventEmitter,
  ChangeDetectionStrategy, signal, ElementRef, ViewChild, AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-qr-scanner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './qr-scanner.component.html',
  styleUrl: './qr-scanner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QrScannerComponent implements AfterViewInit, OnDestroy {
  @Output() scanned = new EventEmitter<string>();
  @Output() scanError = new EventEmitter<string>();

  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  readonly status = signal<'idle' | 'starting' | 'scanning' | 'error'>('idle');
  readonly errorMessage = signal<string | null>(null);

  private stream: MediaStream | null = null;
  private animationFrame: number | null = null;
  private jsQR: ((data: Uint8ClampedArray, width: number, height: number) => { data: string } | null) | null = null;

  async ngAfterViewInit(): Promise<void> {
    this.status.set('starting');
    try {
      const mod = await import('jsqr');
      this.jsQR = (mod.default ?? mod) as typeof this.jsQR;
    } catch {
      this.status.set('error');
      this.errorMessage.set('No se pudo cargar el módulo QR. Instale jsqr.');
      this.scanError.emit('jsqr not available');
      return;
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      const video = this.videoRef.nativeElement;
      video.srcObject = this.stream;
      await video.play();
      this.status.set('scanning');
      this.tick();
    } catch (err) {
      this.status.set('error');
      const msg = err instanceof Error ? err.message : 'Camera access denied';
      this.errorMessage.set(msg);
      this.scanError.emit(msg);
    }
  }

  ngOnDestroy(): void {
    this.stop();
  }

  private tick(): void {
    const video = this.videoRef?.nativeElement;
    const canvas = this.canvasRef?.nativeElement;
    if (!video || !canvas || !this.jsQR) return;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const result = this.jsQR(imageData.data, imageData.width, imageData.height);
        if (result?.data) {
          this.stop();
          this.scanned.emit(result.data);
          return;
        }
      }
    }

    this.animationFrame = requestAnimationFrame(() => this.tick());
  }

  private stop(): void {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
  }
}
