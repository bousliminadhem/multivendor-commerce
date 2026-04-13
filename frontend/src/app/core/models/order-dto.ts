import { OrderItemDto } from './order-item-dto';

export type OrderStatus = 'PENDING' | 'PAID' | 'PACKING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderStatusTimeline {
  status: OrderStatus;
  timestamp: string;
  message?: string;
}

export interface OrderDto {
  id?: number;
  userId?: number;
  userEmail?: string;
  status?: OrderStatus;
  totalAmount?: number;
  shippingAddress: string;
  items: OrderItemDto[];
  createdAt?: string;
  updatedAt?: string;
  estimatedDeliveryDate?: string;
  trackingNumber?: string;
  statusTimeline?: OrderStatusTimeline[];
}
