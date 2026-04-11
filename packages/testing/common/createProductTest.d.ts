export function createProductTest(): void;
export const GRAPHQL_URL: any;
export const AUTH_TOKEN: any;
export const STORE_ID: any;
export const CATEGORY_ID: any;
export const CATEGORY_NAME: any;
export const CREATE_PRODUCT_MUTATION: "\nmutation CreateProduct($createProductInput: CreateProductInput!) {\n  createProduct(createProductInput: $createProductInput) {\n    success\n    message\n    data {\n      id\n      productName\n      category {\n        id\n        name\n      }\n      variants {\n        id\n        sku\n        barcode\n        costPrice\n        sellingPrice\n        stock\n        status\n        attributes {\n          name\n          value\n        }\n      }\n    }\n  }\n}\n";
