import { Component, Signal, computed, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, NgStyle } from '@angular/common';
import { BannerMetadataDto } from '../../../core/models/banner-metadata-dto';

@Component({
  selector: 'app-hero-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="relative w-full overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 py-20 sm:py-32">
      <!-- Background -->
      <div class="absolute inset-0">
        @if (banner()?.backgroundImageUrl) {
          <img 
            [src]="banner()!.backgroundImageUrl" 
            alt="Banner background"
            class="h-full w-full object-cover opacity-40"
          />
          <div class="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/60 to-slate-900/40"></div>
        } @else {
          <div class="absolute inset-0" [style.background]="gradientStyle()"></div>
        }
      </div>

      <!-- Content -->
      <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col justify-center min-h-[400px] sm:min-h-[500px]">
        <div class="max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <!-- Subtitle Badge -->
          @if (banner()?.subtitle) {
            <div class="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 border border-white/20">
              <span class="h-2 w-2 rounded-full bg-indigo-400"></span>
              <span class="text-sm font-semibold text-white">{{ banner()!.subtitle }}</span>
            </div>
          }

          <!-- Main Title -->
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
            {{ banner()?.title || 'Welcome to Aurora Market' }}
          </h1>

          <!-- Description -->
          @if (banner()?.description) {
            <p class="text-lg sm:text-xl text-white/90 leading-relaxed max-w-xl">
              {{ banner()!.description }}
            </p>
          }

          <!-- CTA Button -->
          @if (banner()?.ctaText && banner()?.ctaLink) {
            <div class="pt-4">
              <a 
                [href]="banner()!.ctaLink"
                class="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 text-white font-bold shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
              >
                {{ banner()!.ctaText }}
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
              </a>
            </div>
          }
        </div>

        <!-- Decorative Elements -->
        <div class="absolute bottom-10 right-10 hidden lg:block">
          <div class="h-32 w-32 rounded-full bg-indigo-500/20 blur-3xl animate-pulse"></div>
        </div>
        <div class="absolute top-20 right-20 hidden lg:block">
          <div class="h-40 w-40 rounded-full bg-blue-500/10 blur-3xl animate-pulse delay-700"></div>
        </div>
      </div>

      <!-- Parallax Indicator -->
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg class="h-6 w-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      </div>
    </section>
  `,
  styles: [`
    @keyframes slide-in-from-bottom {
      from {
        opacity: 0;
        transform: translateY(1rem);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-in {
      animation: slide-in-from-bottom 0.7s ease-out;
    }

    .delay-700 {
      animation-delay: 0.7s;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroBannerComponent {
  readonly banner = input<BannerMetadataDto | null>(null);

  readonly gradientStyle = computed(() => {
    const banner = this.banner();
    if (!banner) return 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)';
    const start = banner.gradientStart || '#4f46e5';
    const end = banner.gradientEnd || '#06b6d4';
    return `linear-gradient(135deg, ${start} 0%, ${end} 100%)`;
  });
}
