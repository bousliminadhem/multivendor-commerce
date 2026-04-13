import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MetadataService } from '../../../core/services/metadata.service';
import { signal } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <footer class="bg-gradient-to-b from-slate-900 to-slate-950 text-white">
      <!-- Main Footer -->
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          <!-- Brand -->
          <div class="lg:col-span-1 space-y-4">
            <div class="flex items-center gap-2">
              <div class="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center font-bold">
                A
              </div>
              <span class="text-xl font-bold">Aurora</span>
            </div>
            <p class="text-sm text-slate-400">
              Premium e-commerce platform built for excellence and elegance.
            </p>
            <div class="flex gap-3">
              <a href="#" class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 hover:bg-indigo-600 transition">
                <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
                </svg>
              </a>
              <a href="#" class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 hover:bg-indigo-600 transition">
                <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20v-7.21H5.5V9.25h2.79V7.02c0-2.7 1.65-4.18 4.07-4.18 1.16 0 2.16.09 2.45.13v2.84h-1.68c-1.32 0-1.57.63-1.57 1.55V9.25h3.15l-.41 3.54h-2.74V20"></path>
                </svg>
              </a>
              <a href="#" class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 hover:bg-indigo-600 transition">
                <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 002.856-3.33 9.964 9.964 0 01-2.824.776 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"></path>
                </svg>
              </a>
            </div>
          </div>

          <!-- Quick Links -->
          <div class="space-y-4">
            <h3 class="text-sm font-bold uppercase tracking-wider">Shop</h3>
            <ul class="space-y-2 text-sm">
              <li><a routerLink="/catalog" class="text-slate-400 hover:text-white transition">All Products</a></li>
              <li><a href="#" class="text-slate-400 hover:text-white transition">New Arrivals</a></li>
              <li><a href="#" class="text-slate-400 hover:text-white transition">Best Sellers</a></li>
              <li><a href="#" class="text-slate-400 hover:text-white transition">Sale</a></li>
            </ul>
          </div>

          <!-- Company -->
          <div class="space-y-4">
            <h3 class="text-sm font-bold uppercase tracking-wider">Company</h3>
            <ul class="space-y-2 text-sm">
              <li><a href="#" class="text-slate-400 hover:text-white transition">About Us</a></li>
              <li><a href="#" class="text-slate-400 hover:text-white transition">Blog</a></li>
              <li><a href="#" class="text-slate-400 hover:text-white transition">Careers</a></li>
              <li><a href="#" class="text-slate-400 hover:text-white transition">Press</a></li>
            </ul>
          </div>

          <!-- Support -->
          <div class="space-y-4">
            <h3 class="text-sm font-bold uppercase tracking-wider">Support</h3>
            <ul class="space-y-2 text-sm">
              <li><a href="#" class="text-slate-400 hover:text-white transition">Help Center</a></li>
              <li><a href="#" class="text-slate-400 hover:text-white transition">Contact Us</a></li>
              <li><a href="#" class="text-slate-400 hover:text-white transition">Shipping Info</a></li>
              <li><a href="#" class="text-slate-400 hover:text-white transition">Returns</a></li>
            </ul>
          </div>

          <!-- Newsletter -->
          <div class="space-y-4">
            <h3 class="text-sm font-bold uppercase tracking-wider">Newsletter</h3>
            <p class="text-sm text-slate-400">Subscribe to get special offers and updates.</p>
            <form class="space-y-2" (ngSubmit)="onSubscribe($event)">
              <input 
                type="email" 
                placeholder="Enter your email"
                class="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
              <button 
                type="submit"
                class="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold hover:shadow-lg transition"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <!-- Divider -->
        <div class="border-t border-slate-700 my-12"></div>

        <!-- Bottom Footer -->
        <div class="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-400">
          <p>&copy; {{ currentYear }} Aurora Market. All rights reserved.</p>
          <div class="flex gap-6">
            <a href="#" class="hover:text-white transition">Privacy Policy</a>
            <a href="#" class="hover:text-white transition">Terms of Service</a>
            <a href="#" class="hover:text-white transition">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent implements OnInit {
  private readonly metadataService = inject(MetadataService);
  
  readonly currentYear = new Date().getFullYear();
  readonly footerContent = signal<any>(null);

  ngOnInit(): void {
    this.metadataService.getFooterContent().subscribe({
      next: (content) => this.footerContent.set(content),
      error: () => {} // Graceful fallback to default content
    });
  }

  onSubscribe(event: Event): void {
    event.preventDefault();
    // Handle newsletter subscription
  }
}
