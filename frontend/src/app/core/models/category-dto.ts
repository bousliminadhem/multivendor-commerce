export interface CategoryDto {
  id?: number;
  name: string;
  slug?: string;
  description?: string;
  createdAt?: string;
  subCategories?: CategoryDto[];
}
