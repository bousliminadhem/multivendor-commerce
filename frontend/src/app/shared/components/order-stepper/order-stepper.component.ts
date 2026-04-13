import { Component, computed, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderDto, OrderStatus } from '../../../core/models/order-dto';

@Component({
  selector: 'app-order-stepper',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-3">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-sm font-bold uppercase tracking-wider text-slate-600">Order Status</h3>
        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold" 
          [class.bg-yellow-100]="currentStatus() === 'PENDING'"
          [class.text-yellow-700]="currentStatus() === 'PENDING'"
          [class.bg-blue-100]="currentStatus() === 'PAID'"
          [class.text-blue-700]="currentStatus() === 'PAID'"
          [class.bg-purple-100]="currentStatus() === 'PACKING'"
          [class.text-purple-700]="currentStatus() === 'PACKING'"
          [class.bg-indigo-100]="currentStatus() === 'SHIPPED'"
          [class.text-indigo-700]="currentStatus() === 'SHIPPED'"
          [class.bg-emerald-100]="currentStatus() === 'DELIVERED'"
          [class.text-emerald-700]="currentStatus() === 'DELIVERED'"
        >
          {{ formatStatus(currentStatus()) }}
        </span>
      </div>

      <div class="relative">
        <!-- Progress Bar Background -->
        <div class="absolute top-5 left-0 h-1 w-full bg-slate-200 rounded-full"></div>
        
        <!-- Progress Bar Fill -->
        <div 
          class="absolute top-5 left-0 h-1 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500"
          [style.width.%]="progressPercentage()"
        ></div>

        <!-- Stepper Items -->
        <div class="relative flex justify-between">
          @for (status of statuses; track status; let i = $index) {
            <div class="flex flex-col items-center gap-3">
              <!-- Status Circle -->
              <div 
                class="h-10 w-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-sm"
                [class.bg-indigo-600]="isCompleted(status)"
                [class.border-indigo-600]="isCompleted(status)"
                [class.bg-indigo-400]="!isCompleted(status) && isCurrent(status)"
                [class.border-indigo-400]="!isCompleted(status) && isCurrent(status)"
                [class.bg-white]="!isCompleted(status) && !isCurrent(status)"
                [class.border-slate-300]="!isCompleted(status) && !isCurrent(status)"
              >
                @if (isCompleted(status)) {
                  <svg class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                } @else if (isCurrent(status)) {
                  <div class="h-2 w-2 rounded-full bg-white animate-pulse"></div>
                } @else {
                  <span class="text-xs font-bold text-slate-400">{{ i + 1 }}</span>
                }
              </div>

              <!-- Status Label -->
              <span 
                class="text-xs font-semibold whitespace-nowrap transition-all"
                [class.text-indigo-600]="isCompleted(status) || isCurrent(status)"
                [class.text-slate-500]="!isCompleted(status) && !isCurrent(status)"
              >
                {{ status }}
              </span>
            </div>
          }
        </div>
      </div>

      <!-- Timeline Events -->
      @if ((order()?.statusTimeline?.length ?? 0) > 0) {
        <div class="mt-8 pt-4 border-t border-slate-200 space-y-3">
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-600">Timeline</p>
          @for (event of order()!.statusTimeline; track event.status) {
            <div class="flex items-start gap-3 pl-4 border-l-2 border-indigo-300 pb-3">
              <div class="h-2 w-2 rounded-full bg-indigo-500 mt-2 -ml-[9px]"></div>
              <div>
                <p class="text-xs font-semibold text-slate-900">{{ event.status }}</p>
                <p class="text-xs text-slate-500">{{ formatDate(event.timestamp) }}</p>
                @if (event.message) {
                  <p class="text-xs text-slate-600 mt-1">{{ event.message }}</p>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderStepperComponent {
  readonly order = input<OrderDto | null>(null);
  readonly statuses: OrderStatus[] = ['PENDING', 'PAID', 'PACKING', 'SHIPPED', 'DELIVERED'];

  readonly currentStatus = computed(() => (this.order()?.status || 'PENDING') as OrderStatus);

  readonly progressPercentage = computed(() => {
    const statusIndex = this.statuses.indexOf(this.currentStatus());
    if (statusIndex === -1) return 0;
    if (statusIndex === 0) return 0;
    return ((statusIndex) / (this.statuses.length - 1)) * 100;
  });

  isCompleted(status: OrderStatus): boolean {
    const currentIndex = this.statuses.indexOf(this.currentStatus());
    const statusIndex = this.statuses.indexOf(status);
    return statusIndex < currentIndex;
  }

  isCurrent(status: OrderStatus): boolean {
    return status === this.currentStatus();
  }

  formatStatus(status: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      PENDING: 'Pending',
      PAID: 'Payment Confirmed',
      PACKING: 'Being Packed',
      SHIPPED: 'In Transit',
      DELIVERED: 'Delivered',
      CANCELLED: 'Cancelled'
    };
    return map[status] || status;
  }

  formatDate(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  }
}
