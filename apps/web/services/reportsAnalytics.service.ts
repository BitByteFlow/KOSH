import { gql } from "@/gql";

export const GET_ANALYTICS_METRICS = gql(`
  query GetReportData($startDate: String!, $endDate: String!) {
    getAnalyticsMetrics(startDate: $startDate, endDate: $endDate) {
      success
      message
      data {
        label
        value
        trend
        trendLabel
        isPositive
        subtitle
      }
    }
  }
`);

export const GET_SALES_TREND = gql(`
  query GetSalesTrend($startDate: String!, $endDate: String!) {
    getSalesTrend(startDate: $startDate, endDate: $endDate) {
      success
      message
      data {
        label
        value
      }
    }
  }
`);

export const GET_TOP_PRODUCTS = gql(`
  query GetTopProducts($startDate: String!, $endDate: String!) {
    getTopProducts(startDate: $startDate, endDate: $endDate) {
      success
      message
      data {
        name
        revenue
      }
    }
  }
`);

export const GET_PRODUCT_PERFORMANCE = gql(`
  query GetProductPerformance($filters: ProductPerformanceFilter!) {
    getProductPerformance(filters: $filters) {
      totalCount
      items {
        id
        name
        category
        sku
        sold
        revenue
        margin
        status
      }
    }
  }
`);

export const GET_ANALYTICS_TRANSACTIONS = gql(`
  query GetAnalyticsTransactions($filters: AnalyticsTransactionFilter!) {
    getAnalyticsTransactions(filters: $filters) {
      totalCount
      data {
        id
        date
        time
        paymentType
        amount
        profit
        status
      }
    }
  }
`);

export const GET_SALES_REPORT = gql(`
  query GetSalesReport($filters: SaleReportFilter!) {
    getSalesReport(filters: $filters) {
      success
      message
      data {
        id
        date
        customer
        items
        total
        payment
        status
      }
    }
  }
`);

export const GET_INVENTORY_REPORT = gql(`
  query GetInventoryReport($filters: InventoryReportFilter!) {
    getInventoryReport(filters: $filters) {
      totalCount
      data {
        id
        name
        category
        sku
        stock
        value
        status
      }
    }
  }
`);

export interface AnalyticsMetric {
  label: string;
  value: string;
  trend?: number;
  trendLabel?: string;
  isPositive?: boolean;
  subtitle?: string;
}
