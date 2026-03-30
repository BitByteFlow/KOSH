import { createSaleTest } from '../common/createSaleTest.js';

export const options = {
    scenarios: {
        createSaleLoad: {
            executor: 'constant-vus',
            vus: 10,
            duration: '30s',
            tags: { test_type: 'load' },
        },
    },
    thresholds: {
        'http_req_duration': ['p(95)<500'], // 95% of requests should be below 500ms
        'http_req_failed': ['rate<0.01'],    // http errors should be less than 1%
    },
};

export default createSaleTest;
