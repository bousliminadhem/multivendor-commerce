import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [NgClass],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastComponent {
  private readonly toast = inject(ToastService);
  protected readonly messages = this.toast.messages;

  dismiss(id: number): void {
    this.toast.remove(id);
  }
}
