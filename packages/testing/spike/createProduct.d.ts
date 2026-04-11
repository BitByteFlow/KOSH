export namespace options {
    namespace scenarios {
        namespace spike {
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
export default createProductTest;
import { createProductTest } from '../common/createProductTest.js';
