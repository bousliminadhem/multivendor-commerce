export interface BannerMetadataDto {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  backgroundImageUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  gradientStart?: string;
  gradientEnd?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
