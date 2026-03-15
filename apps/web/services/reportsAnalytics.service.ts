import {
  GetReportDataDocument,
  GetSalesTrendDocument,
  GetTopProductsDocument,
  GetProductPerformanceDocument,
  GetAnalyticsTransactionsDocument,
  GetSalesReportDocument,
  GetInventoryReportDocument
} from "@/gql/graphql";

export const GET_ANALYTICS_METRICS = GetReportDataDocument;
export const GET_SALES_TREND = GetSalesTrendDocument;
export const GET_TOP_PRODUCTS = GetTopProductsDocument;

export const GET_PRODUCT_PERFORMANCE = GetProductPerformanceDocument;
export const GET_ANALYTICS_TRANSACTIONS = GetAnalyticsTransactionsDocument;
export const GET_SALES_REPORT = GetSalesReportDocument;
export const GET_INVENTORY_REPORT = GetInventoryReportDocument;

export interface AnalyticsMetric {
  label: string;
  value: string;
  trend?: number;
  trendLabel?: string;
  isPositive?: boolean;
  subtitle?: string;
}
