import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CartStore {
  private readonly countSignal = signal(0);

  readonly count = computed(() => this.countSignal());

  setCount(count: number): void {
    this.countSignal.set(Math.max(0, count));
  }

  increment(by = 1): void {
    this.countSignal.update((current) => current + by);
  }

  reset(): void {
    this.countSignal.set(0);
  }
}
