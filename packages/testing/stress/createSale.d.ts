export namespace options {
    namespace scenarios {
        namespace stress {
            let executor: string;
            let startTime: string;
            let stages: {
                duration: string;
                target: number;
            }[];
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
