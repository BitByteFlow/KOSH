import { createProductTest } from '../common/createProductTest.js';

export const options = {
    scenarios: {
        createProductSmoke: {
            executor: 'shared-iterations',
            vus: 1,
            iterations: 1,
            maxDuration: '30s',
            tags: { test_type: 'smoke' },
        },
    },
    thresholds: {
        'http_req_duration': ['p(95)<200'], // 95% of requests should be below 200ms
        'http_req_failed': ['rate<0.01'],    // http errors should be less than 1%
    },
};

export default createProductTest;
