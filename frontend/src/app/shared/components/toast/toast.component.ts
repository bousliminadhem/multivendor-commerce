import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center">
      <div class="flex w-full max-w-xl flex-col gap-3 px-4">
        @for (toast of messages(); track toast.id) {
          <div
            class="pointer-events-auto flex items-start gap-3 rounded-2xl px-4 py-3 shadow-soft ring-1"
            [ngClass]="{
              'bg-white ring-slate-100 text-slate-900': toast.variant === 'info',
              'bg-white ring-green-100 text-slate-900': toast.variant === 'success',
              'bg-white ring-rose-100 text-slate-900': toast.variant === 'error'
            }"
          >
            <div class="mt-1 h-2 w-2 rounded-full"
                 [ngClass]="{
                   'bg-slate-400': toast.variant === 'info',
                   'bg-green-500': toast.variant === 'success',
                   'bg-rose-500': toast.variant === 'error'
                 }"></div>
            <div class="flex-1 text-sm font-medium leading-5">{{ toast.message }}</div>
            <button
              type="button"
              class="text-slate-400 transition hover:text-slate-600"
              aria-label="Dismiss notification"
              (click)="dismiss(toast.id)"
            >
              ✕
            </button>
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastComponent {
  private readonly toast = inject(ToastService);
  protected readonly messages = this.toast.messages;

  dismiss(id: number): void {
    this.toast.remove(id);
  }
}
