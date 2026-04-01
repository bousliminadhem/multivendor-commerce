export interface ProductDto {
  id?: number;
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  imageUrl?: string;
  categoryId: number;
  categoryName?: string;
  createdAt?: string;
  updatedAt?: string;
}
