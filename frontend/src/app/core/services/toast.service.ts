import { Injectable, computed, signal } from '@angular/core';

export type ToastVariant = 'success' | 'error' | 'info';

interface ToastMessage {
  id: number;
  message: string;
  variant: ToastVariant;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly messagesSignal = signal<ToastMessage[]>([]);
  readonly messages = computed(() => this.messagesSignal());

  info(message: string): void {
    this.push(message, 'info');
  }

  success(message: string): void {
    this.push(message, 'success');
  }

  error(message: string): void {
    this.push(message, 'error');
  }

  remove(id: number): void {
    this.messagesSignal.update((list) => list.filter((item) => item.id !== id));
  }

  private push(message: string, variant: ToastVariant): void {
    const id = Date.now() + Math.random();
    this.messagesSignal.update((list) => [...list, { id, message, variant }]);
    setTimeout(() => this.remove(id), 4200);
  }
}
