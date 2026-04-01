import { createProductTest } from '../common/createProductTest.js';

export const options = {
    scenarios: {
        stress: {
            executor: 'ramping-vus',
            startTime: '0s',
            stages: [
                { duration: '1m', target: 20 },   // Warm up
                { duration: '3m', target: 50 },   // Normal load
                { duration: '2m', target: 100 },  // Increased load
                { duration: '2m', target: 150 },  // Stress point
                { duration: '1m', target: 0 },    // Cooldown
            ],
            tags: { test_type: 'stress' },
        },
    },
    thresholds: {
        'http_req_duration': ['p(95)<1500', 'p(99)<3000'], // Expect higher latencies under stress
        'http_req_failed': ['rate<0.10'], // Allow higher failure rate under stress
    },
};

export default createProductTest;
