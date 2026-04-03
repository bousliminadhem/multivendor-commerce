export interface ProductDto {
  id?: number;
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  imageUrl?: string;
  imageUrls?: string[];
  categoryId: number;
  categoryName?: string;
  vendorName?: string;
  createdAt?: string;
  updatedAt?: string;
}
