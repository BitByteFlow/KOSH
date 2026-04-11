export namespace options {
    namespace scenarios {
        namespace createProductLoad {
            let executor: string;
            let vus: number;
            let duration: string;
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
