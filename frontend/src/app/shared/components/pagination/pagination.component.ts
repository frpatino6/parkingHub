import { Component, input, output, computed, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent {
  readonly totalItems = input.required<number>();
  readonly pageSize = input<number>(20);
  readonly currentPage = input<number>(1);

  readonly pageChange = output<number>();

  readonly totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));

  readonly pages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const delta = 2;
    const pages: (number | null)[] = [];

    for (let i = 1; i <= total; i++) {
      if (
        i === 1 ||
        i === total ||
        (i >= current - delta && i <= current + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== null) {
        pages.push(null);
      }
    }
    return pages;
  });

  goTo(page: number | null): void {
    if (page === null) return;
    if (page < 1 || page > this.totalPages()) return;
    if (page === this.currentPage()) return;
    this.pageChange.emit(page);
  }
}
