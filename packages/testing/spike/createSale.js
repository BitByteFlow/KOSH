import { createSaleTest } from '../common/createSaleTest.js';

export const options = {
    scenarios: {
        spike: {
            executor: 'ramping-vus',
            startTime: '0s',
            stages: [
                { duration: '10s', target: 30 },  // Ramping up to 30 VUs
                { duration: '30s', target: 30 },  // Stay at 30 VUs
                { duration: '5s', target: 100 },  // Spike to 100 VUs
                { duration: '10s', target: 100 }, // Stay at 100 VUs
                { duration: '5s', target: 30 },   // Ramp down to 30 VUs
                { duration: '10s', target: 0 },   // Ramp down to 0 VUs
            ],
            tags: { test_type: 'spike' },
        },
    },
    thresholds: {
        'http_req_duration': ['p(95)<1200', 'p(99)<2500'], // Expect higher latencies during spikes
        'http_req_failed': ['rate<0.05'], // Allow higher failure rate during spikes
    },
};

export default createSaleTest;
