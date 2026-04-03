import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../core/services/toast.service';
import { OrderDto } from '../../core/models/order-dto';

@Component({
  selector: 'app-vendor-orders',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe],
  templateUrl: './vendor-orders.component.html',
  styleUrls: ['./vendor-orders.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VendorOrdersComponent {
  private readonly orderService = inject(OrderService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly orders = signal<OrderDto[]>([]);
  readonly expandedOrderIds = signal<Set<number>>(new Set<number>());
  readonly updatingStatusId = signal<number | null>(null);

  readonly skeletons = Array.from({ length: 3 }, (_, i) => i);
  readonly hasOrders = computed(() => this.orders().length > 0);
  
  readonly totalOrders = computed(() => this.orders().length);
  
  readonly totalRevenue = computed(() => {
    return this.orders().reduce((sum, order) => {
      return sum + (order.totalAmount ? Number(order.totalAmount) : 0);
    }, 0);
  });

  constructor() {
    this.loadVendorOrders();
  }

  toggleExpand(orderId?: number): void {
    if (orderId == null) return;
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
    if (orderId == null) return false;
    return this.expandedOrderIds().has(orderId);
  }

  statusBadgeClass(status?: string): string {
    const normalized = (status ?? '').toUpperCase();
    if (normalized === 'SHIPPED') {
      return 'border border-blue-200 bg-blue-50 text-blue-700';
    }
    if (normalized === 'DELIVERED') {
      return 'border border-emerald-200 bg-emerald-50 text-emerald-700';
    }
    if (normalized === 'PENDING') {
      return 'border border-amber-200 bg-amber-50 text-amber-700';
    }
    return 'border border-slate-200 bg-slate-100 text-slate-700';
  }

  onMarkAsShipped(orderId?: number): void {
    if (orderId == null) return;

    this.updatingStatusId.set(orderId);

    this.orderService
      .updateStatus(orderId, 'SHIPPED')
      .pipe(
        finalize(() => this.updatingStatusId.set(null)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (updatedOrder) => {
          this.orders.update((current) =>
            current.map((order) => (order.id === orderId ? updatedOrder : order))
          );
          this.toast.success('Order marked as shipped.');
        },
        error: () => {
          this.toast.error('Failed to update order status.');
        }
      });
  }

  private loadVendorOrders(): void {
    this.loading.set(true);
    this.error.set(null);

    this.orderService
      .getVendorOrders({ page: 0, size: 50 })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (page) => this.orders.set(page.content ?? []),
        error: () => this.error.set('Unable to load your sales right now.')
      });
  }
}
