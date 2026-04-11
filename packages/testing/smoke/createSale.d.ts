export namespace options {
    namespace scenarios {
        namespace createSaleSmoke {
            let executor: string;
            let vus: number;
            let iterations: number;
            let maxDuration: string;
            namespace tags {
                let test_type: string;
            }
        }
    }
    namespace thresholds {
        let http_req_duration: string[];
        let http_req_failed: string[];
    }
}
export default createSaleTest;
import { createSaleTest } from '../common/createSaleTest.js';
