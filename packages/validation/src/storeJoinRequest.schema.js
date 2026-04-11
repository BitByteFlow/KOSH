"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandleJoinRequestSchema = void 0;
const zod_1 = require("zod");
exports.HandleJoinRequestSchema = zod_1.z.object({
    status: zod_1.z.enum(["PENDING", "ACCEPTED", "REJECTED"]),
    storeId: zod_1.z.uuid(),
});
//# sourceMappingURL=storeJoinRequest.schema.js.map