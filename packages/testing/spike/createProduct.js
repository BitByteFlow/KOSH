import { createProductTest } from '../common/createProductTest.js';

export const options = {
    scenarios: {
        spike: {
            executor: 'ramping-vus',
            startTime: '0s',
            stages: [
                { duration: '10s', target: 50 },  // Ramping up to 50 VUs
                { duration: '30s', target: 50 },  // Stay at 50 VUs
                { duration: '5s', target: 200 },  // Spike to 200 VUs
                { duration: '10s', target: 200 }, // Stay at 200 VUs
                { duration: '5s', target: 50 },   // Ramp down to 50 VUs
                { duration: '10s', target: 0 },   // Ramp down to 0 VUs
            ],
            tags: { test_type: 'spike' },
        },
    },
    thresholds: {
        'http_req_duration': ['p(95)<1000', 'p(99)<2000'], // Expect higher latencies during spikes
        'http_req_failed': ['rate<0.05'], // Allow higher failure rate during spikes
    },
};

export default createProductTest;
