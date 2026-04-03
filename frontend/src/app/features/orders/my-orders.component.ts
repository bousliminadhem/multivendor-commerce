import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OrderService } from '../../core/services/order.service';
import { OrderDto } from '../../core/models/order-dto';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, NgClass],
  templateUrl: './my-orders.component.html',
  styleUrls: ['./my-orders.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyOrdersComponent {
  private readonly orderService = inject(OrderService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly orders = signal<OrderDto[]>([]);
  readonly expandedOrderIds = signal<Set<number>>(new Set<number>());

  readonly hasOrders = computed(() => this.orders().length > 0);

  constructor() {
    this.loadOrders();
  }

  toggleExpand(orderId?: number): void {
    if (orderId == null) {
      return;
    }
    this.expandedOrderIds.update((current) => {
      const next = new Set(current);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  }

  isExpanded(orderId?: number): boolean {
    if (orderId == null) {
      return false;
    }
    return this.expandedOrderIds().has(orderId);
  }

  statusBadgeClass(status?: string): string {
    const normalized = (status ?? '').toUpperCase();
    if (normalized === 'DELIVERED') {
      return 'border border-emerald-200 bg-emerald-50 text-emerald-700';
    }
    if (normalized === 'PENDING') {
      return 'border border-amber-200 bg-amber-50 text-amber-700';
    }
    return 'border border-slate-200 bg-slate-100 text-slate-700';
  }

  private loadOrders(): void {
    this.loading.set(true);
    this.error.set(null);

    this.orderService
      .getMyOrders({ page: 0, size: 50 })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (page) => this.orders.set(page.content ?? []),
        error: () => this.error.set('Unable to load your orders right now.')
      });
  }
}
