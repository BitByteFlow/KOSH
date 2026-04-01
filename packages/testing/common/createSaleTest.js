import { check, sleep } from 'k6';
import { sendGraphQLRequest } from '../utils/graphqlClient.js';
import {
  generateRandomPaymentType,
  generateSaleItemData,
  generateRandomNumber,
  generateRandomString,
} from '../utils/dataGenerator.js';

export const GRAPHQL_URL = __ENV.URL || 'http://localhost:4000/graphql';
export const AUTH_TOKEN = __ENV.TOKEN || 'YOUR_AUTH_TOKEN';
export const STORE_ID = __ENV.STORE_ID || 'YOUR_STORE_ID';
export const VARIANT_ID = __ENV.VARIANT_ID || 'YOUR_VARIANT_ID';

export const CREATE_SALE_MUTATION = `
mutation CreateSale($createSaleInput: CreateSaleInput!) {
  createSale(createSaleInput: $createSaleInput) {
    success
    message
    data {
      id
      total
      discount
      profit
      paymentType
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

export function createSaleTest() {
  const paymentType = generateRandomPaymentType();
  const items = [generateSaleItemData(VARIANT_ID)];
  const discount = generateRandomNumber(0, 10);

  const variables = {
    createSaleInput: {
      storeId: STORE_ID,
      discount: discount,
      paymentType: paymentType,
      items: items,
      transactionNote: 'Performance test sale',
      customerName: paymentType === 'CREDIT' ? `Customer-${generateRandomString(5)}` : undefined,
      customerEmail:
        paymentType === 'CREDIT' ? `customer-${generateRandomNumber(3)}@gmail.com` : undefined,
      customerContact: paymentType === 'CREDIT' ? '9818000000' : undefined,
    },
  };
  console.log('this is varaible', variables);

  const res = sendGraphQLRequest(
    GRAPHQL_URL,
    CREATE_SALE_MUTATION,
    variables,
    AUTH_TOKEN,
    STORE_ID
  );

  check(res, {
    'is status 200': (r) => r.status === 200,
    'response body success is true': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data.createSale.success === true;
      } catch (e) {
        console.error('Failed to parse response body:', r.body);
        return false;
      }
    },
    'sale ID is present': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data.createSale.data[0].id !== undefined;
      } catch (e) {
        return false;
      }
    },
  });

  if (res.status !== 200) {
    console.error(`Request failed with status ${res.status}: ${res.body}`);
  } else {
    try {
      const body = JSON.parse(res.body);
      if (!body.data.createSale.success) {
        console.error(`Sale creation failed: ${body.data.createSale.message}`);
      }
    } catch (e) {
      // Already logged parse error above
    }
  }

  sleep(1);
}
