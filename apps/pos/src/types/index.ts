export interface Product {
  id: string;
  name: string;
  description?: string;
  variants: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  sku: string;
  barcode: string;
  sellingPrice: number;
  costPrice: number;
  stock: number;
  product: {
    id: string;
    name: string;
  };
}

export interface SaleItemInput {
  variantId: string;
  quantity: number;
  sellPrice: number;
  costPrice: number;
}

export interface CreateSaleInput {
  total: number;
  discount: number;
  profit: number;
  paymentType: 'CASH' | 'ONLINE' | 'CREDIT';
  userId: string;
  storeId: string;
  items: SaleItemInput[];
}
