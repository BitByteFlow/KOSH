import { check, sleep } from 'k6';
import { sendGraphQLRequest } from '../utils/graphqlClient.js';
import { generateUniqueProductName, generateVariantData } from '../utils/dataGenerator.js';

// Shared Constants
export const GRAPHQL_URL = __ENV.URL || 'http://localhost:4000/graphql';
export const AUTH_TOKEN = __ENV.TOKEN || 'YOUR_AUTH_TOKEN';
export const STORE_ID = __ENV.STORE_ID || 'YOUR_STORE_ID';
export const CATEGORY_ID = __ENV.CATEGORY_ID || 'YOUR_CATEGORY_ID';

export const CREATE_PRODUCT_MUTATION = `
mutation CreateProduct($createProductInput: CreateProductInput!) {
  createProduct(createProductInput: $createProductInput) {
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
        costPrice
        sellingPrice
        stock
        status
        attributes {
          name
          value
        }
      }
    }
  }
}
`;

// Common test function
export function createProductTest() {
    const productName = generateUniqueProductName();
    const variants = [generateVariantData()]; // Create one variant for simplicity

    const variables = {
        createProductInput: {
            name: productName,
            categoryId: CATEGORY_ID,
            variants: variants,
            keepPurchaseRecord: false,
        }
    };

    const res = sendGraphQLRequest(GRAPHQL_URL, CREATE_PRODUCT_MUTATION, variables, AUTH_TOKEN, STORE_ID);

    check(res, {
        'is status 200': (r) => r.status === 200,
        'response body success is true': (r) => {
            try {
                const body = JSON.parse(r.body);
                return body.data.createProduct.success === true;
            } catch (e) {
                console.error('Failed to parse response body:', r.body);
                return false;
            }
        },
        'product ID is present': (r) => {
            try {
                const body = JSON.parse(r.body);
                return body.data.createProduct.data[0].id !== undefined;
            } catch (e) {
                return false;
            }
        }
    });

    if (res.status !== 200) {
        console.error(`Request failed with status ${res.status}: ${res.body}`);
    } else {
        try {
            const body = JSON.parse(res.body);
            if (!body.data.createProduct.success) {
                console.error(`Product creation failed: ${body.data.createProduct.message}`);
            }
        } catch (e) {
            // Already logged parse error above
        }
    }

    sleep(1);
}
