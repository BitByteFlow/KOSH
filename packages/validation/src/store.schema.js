"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateMemberRoleSchema = exports.AddMemberSchema = exports.UpdateStoreSchema = exports.CreateStoreSchema = void 0;
const zod_1 = require("zod");
exports.CreateStoreSchema = zod_1.z.object({
    name: zod_1.z.string().min(3).max(50),
    description: zod_1.z.string().max(200).optional(),
    address: zod_1.z.string().max(200).optional(),
    phone: zod_1.z.string().max(20).optional(),
});
exports.UpdateStoreSchema = exports.CreateStoreSchema.partial();
exports.AddMemberSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    role: zod_1.z.enum(["ADMIN", "MANAGER", "CASHIER"]),
});
exports.UpdateMemberRoleSchema = zod_1.z.object({
    role: zod_1.z.enum(["ADMIN", "MANAGER", "CASHIER"]),
});
//# sourceMappingURL=store.schema.js.map