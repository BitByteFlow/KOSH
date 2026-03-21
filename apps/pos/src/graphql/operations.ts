import { gql } from '@apollo/client';

export const LIST_PRODUCTS = gql`
  query ListProductsWithFilter($filterInput: ProductFilterInput!) {
    listProductsWithFilter(filterInput: $filterInput) {
      success
      message
      data {
        id
        productName
        category {
          id
          name
        }
        variants {
          id
          sku
          barcode
          attributeValue
          price
          stock
          sellingPrice
          costPrice
        }
      }
    }
  }
`;

export const CREATE_SALE = gql`
  mutation CreateSale($input: CreateSaleInput!) {
    createSale(createSaleInput: $input) {
      success
      message
      data {
        id
        total
        createdAt
      }
    }
  }
`;

export const GET_SALES_HISTORY = gql`
  query GetSales {
    getSales {
      success
      message
      data {
        id
        total
        discount
        profit
        paymentType
        createdAt
        items {
          id
          quantity
          sellPrice
          costPrice
          variantId
        }
      }
    }
  }
`;
