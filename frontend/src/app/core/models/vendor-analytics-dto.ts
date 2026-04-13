export interface VendorAnalyticsDto {
  vendorId: number;
  vendorName: string;
  totalSalesRevenue: number;
  totalOrdersCount: number;
  totalProductsCount: number;
  averageOrderValue: number;
  monthlyRevenue: MonthlySalesData[];
  topProducts: TopProductDto[];
  recentOrders: RecentOrderDto[];
  customerRetentionRate: number;
}

export interface MonthlySalesData {
  month: string;
  revenue: number;
  orderCount: number;
}

export interface TopProductDto {
  productId: number;
  productName: string;
  unitsSold: number;
  revenue: number;
}

export interface RecentOrderDto {
  orderId: number;
  customerName: string;
  totalAmount: number;
  status: 'PENDING' | 'PAID' | 'PACKING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
}
