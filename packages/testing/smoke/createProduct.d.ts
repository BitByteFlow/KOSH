export namespace options {
    namespace scenarios {
        namespace createProductSmoke {
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
export default createProductTest;
import { createProductTest } from '../common/createProductTest.js';
