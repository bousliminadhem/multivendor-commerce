import { OrderItemDto } from './order-item-dto';

export interface OrderDto {
  id?: number;
  userId?: number;
  userEmail?: string;
  status?: string;
  totalAmount?: number;
  shippingAddress: string;
  items: OrderItemDto[];
  createdAt?: string;
  updatedAt?: string;
}
