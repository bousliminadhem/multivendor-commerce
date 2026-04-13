import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, ViewChild, ElementRef, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CurrencyPipe, DatePipe, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { VendorService } from '../../core/services/vendor.service';
import { PageRequest } from '../../core/utils/http-params.util';
import { ProductDto } from '../../core/models/product-dto';
import { OrderDto } from '../../core/models/order-dto';
import { combineLatest, map, of, startWith, switchMap } from 'rxjs';
import { AuthStore } from '../../core/store/auth.store';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './vendor-dashboard.component.html',
  styleUrls: ['./vendor-dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VendorDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly vendorService = inject(VendorService);
  private readonly authStore = inject(AuthStore);

  @ViewChild('revenueChart') revenueChartRef!: ElementRef<HTMLCanvasElement>;
  
  private chart: Chart | null = null;
  readonly page = signal<PageRequest>({ page: 0, size: 9 });
  readonly vendorId = this.vendorService.vendorId;
  protected readonly isAdmin = computed(() => this.authStore.isAdmin());

  // Monthly revenue data for chart
  readonly monthlyRevenue = signal([
    { month: 'Jan', revenue: 2400 },
    { month: 'Feb', revenue: 1398 },
    { month: 'Mar', revenue: 9800 },
    { month: 'Apr', revenue: 3908 },
    { month: 'May', revenue: 4800 },
    { month: 'Jun', revenue: 3800 },
    { month: 'Jul', revenue: 4300 },
    { month: 'Aug', revenue: 5200 },
    { month: 'Sep', revenue: 6100 },
    { month: 'Oct', revenue: 5800 },
    { month: 'Nov', revenue: 6500 },
    { month: 'Dec', revenue: 7200 }
  ]);

  private readonly productsSignal = toSignal(
    combineLatest([
      toObservable(this.vendorService.vendorId),
      toObservable(this.page)
    ]).pipe(
      switchMap(([vendorId, page]) =>
        vendorId == null
          ? of<ProductDto[]>([])
          : this.vendorService
              .getVendorProducts(vendorId, page)
              .pipe(map((res) => res.content))
      ),
      startWith([] as ProductDto[])
    ),
    { initialValue: [] as ProductDto[] }
  );

  private readonly ordersSignal = signal<OrderDto[]>([]);

  readonly products = computed(() => this.productsSignal());
  readonly totalOrders = computed(() => this.ordersSignal().length);
  readonly totalRevenue = computed(() =>
    this.ordersSignal().reduce((sum: number, order: OrderDto) => sum + (order.totalAmount ?? 0), 0)
  );

  readonly totalProducts = computed(() => this.products().length);
  readonly avgProductPrice = computed(() => {
    const products = this.products();
    if (products.length === 0) return 0;
    const sum = products.reduce((acc, p) => acc + (p.price || 0), 0);
    return sum / products.length;
  });

  constructor() {
    const userId = this.authStore.user()?.id ?? null;
    this.vendorService.setVendor(userId);
  }

  ngOnInit(): void {
    // Initialization handled in ngAfterViewInit
  }

  ngAfterViewInit(): void {
    // Ensure ViewChild is resolved before accessing canvas
    if (this.revenueChartRef?.nativeElement) {
      // Small delay to ensure DOM is fully rendered
      setTimeout(() => {
        this.initializeChart(this.revenueChartRef.nativeElement);
      }, 0);
    }
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }

  private initializeChart(canvas: HTMLCanvasElement): void {
    if (!canvas) {
      console.warn('Chart canvas element not found');
      return;
    }

    // Destroy previous chart instance if it exists
    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.warn('Could not get 2D context from canvas');
      return;
    }

    const data = this.monthlyRevenue();
    
    // Create gradient fill
    const gradientFill = ctx.createLinearGradient(0, 0, 0, 300);
    gradientFill.addColorStop(0, 'rgba(79, 70, 229, 0.3)');
    gradientFill.addColorStop(1, 'rgba(79, 70, 229, 0.01)');

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: data.map(d => d.month),
        datasets: [
          {
            label: 'Monthly Revenue',
            data: data.map(d => d.revenue),
            borderColor: '#4F46E5',
            backgroundColor: gradientFill,
            borderWidth: 3,
            tension: 0.4,
            pointRadius: 6,
            pointBackgroundColor: '#4F46E5',
            pointBorderColor: '#FFFFFF',
            pointBorderWidth: 2,
            pointHoverRadius: 8,
            pointHoverBackgroundColor: '#4338CA',
            fill: true,
            cubicInterpolationMode: 'monotone'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: '#64748B',
              font: { size: 13, weight: 500 },
              padding: 15,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 10,
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 12 },
            borderColor: '#4F46E5',
            borderWidth: 1,
            displayColors: true,
            callbacks: {
              label: (context) => {
                const value = context.parsed.y;
                return `Revenue: $${typeof value === 'number' ? value.toLocaleString() : '0'}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: '#94A3B8',
              font: { size: 11, weight: 500 },
              callback: (value) => `$${(value as number).toLocaleString()}`
            },
            grid: {
              color: 'rgba(203, 213, 225, 0.2)',
              display: true
            }
          },
          x: {
            ticks: {
              color: '#94A3B8',
              font: { size: 11, weight: 500 }
            },
            grid: {
              display: false
            }
          }
        }
      }
    };

    try {
      this.chart = new Chart(ctx, config);
    } catch (error) {
      console.error('Error initializing Chart.js:', error);
    }
  }
}
