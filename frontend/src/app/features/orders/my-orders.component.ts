import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  template: `
    <section class="min-h-[60vh] bg-white">
      <div class="container-xl py-12">
        <h1 class="text-2xl font-semibold text-slate-900">My Orders</h1>
        <p class="mt-2 text-sm text-slate-600">Order history will appear here.</p>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyOrdersComponent {}
