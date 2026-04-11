"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactionsQuerySchema = exports.createTransactionSchema = void 0;
const zod_1 = require("zod");
exports.createTransactionSchema = zod_1.z.object({
    type: zod_1.z.string().min(1, "Type cannot be empty!"),
    amount: zod_1.z.number({ message: "Amount is missing!" }),
    note: zod_1.z.string().optional(),
});
exports.getTransactionsQuerySchema = zod_1.z.object({
    page: zod_1.z.preprocess((val) => Number(val), zod_1.z.number().int().min(1).default(1)).optional(),
    limit: zod_1.z.preprocess((val) => Number(val), zod_1.z.number().int().min(1).default(10)).optional(),
    sortBy: zod_1.z.enum(["createdAt", "amount", "type"]).default("createdAt").optional(),
    sortOrder: zod_1.z.enum(["asc", "desc"]).default("desc").optional(),
});
//# sourceMappingURL=account.schema.js.map