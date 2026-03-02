import { gql } from "@apollo/client";

export const GET_ANALYTICS_METRICS = gql`
  query GetAnalyticsMetrics($startDate: String!, $endDate: String!) {
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
`;

export const GET_SALES_TREND = gql`
  query GetSalesTrend($startDate: String!, $endDate: String!) {
    getSalesTrend(startDate: $startDate, endDate: $endDate) {
      success
      message
      data {
        date
        sales
        profit
      }
    }
  }
`;

export const GET_TOP_PRODUCTS = gql`
  query GetTopProducts($startDate: String!, $endDate: String!) {
    getTopProducts(startDate: $startDate, endDate: $endDate) {
      success
      message
      data {
        id
        productName
        unitsSold
        revenue
      }
    }
  }
`;

export const GET_PRODUCT_PERFORMANCE = gql`
  query GetProductPerformance($filters: ProductPerformanceFilter!) {
    getProductPerformance(filters: $filters) {
      success
      message
      data {
        productId
        productName
        totalQuantity
        totalRevenue
        totalProfit
        variantPerformances {
          variantId
          sku
          attributes {
            name
            value
          }
          quantity
          revenue
          profit
        }
      }
      meta {
        total
      }
    }
  }
`;

export const GET_ANALYTICS_TRANSACTIONS = gql`
  query GetAnalyticsTransactions($filters: AnalyticsTransactionFilter!) {
    getAnalyticsTransactions(filters: $filters) {
      success
      message
      data {
        id
        type
        amount
        description
        reference
        createdAt
        metadata
      }
      meta {
        total
        page
        limit
        totalPages
      }
    }
  }
`;

export interface AnalyticsMetric {
	label: string;
	value: string;
	trend?: number;
	trendLabel?: string;
	isPositive?: boolean;
	subtitle?: string;
}
