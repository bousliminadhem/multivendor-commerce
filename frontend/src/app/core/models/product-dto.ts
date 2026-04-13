export interface ProductDto {
  id?: number;
  name: string;
  description?: string;
  price: number;
  salePrice?: number;
  originalPrice?: number;
  discountPercentage?: number;
  stockQuantity: number;
  imageUrl?: string;
  imageUrls?: string[];
  categoryId: number;
  categoryName?: string;
  vendorId?: number;
  vendorName?: string;
  rating?: number;
  reviewCount?: number;
  tags?: string[];
  specifications?: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
}
