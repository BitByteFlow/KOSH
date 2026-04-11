export function createSaleTest(): void;
export const GRAPHQL_URL: any;
export const AUTH_TOKEN: any;
export const STORE_ID: any;
export const VARIANT_ID: any;
export const CREATE_SALE_MUTATION: "\nmutation CreateSale($createSaleInput: CreateSaleInput!) {\n  createSale(createSaleInput: $createSaleInput) {\n    success\n    message\n    data {\n      id\n      total\n      discount\n      profit\n      paymentType\n      items {\n        id\n        quantity\n        sellPrice\n        costPrice\n        variantId\n      }\n    }\n  }\n}\n";
