"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserSchema = exports.loginRequestSchema = void 0;
const zod_1 = require("zod");
exports.loginRequestSchema = zod_1.z.object({
    googleId: zod_1.z.string().min(1, "Google Id cannot be empty!"),
    email: zod_1.z.string().min(1, "Email cannot be empty!").email("Invalid email format"),
    isCashier: zod_1.z.boolean().default(false),
});
exports.createUserSchema = zod_1.z.object({
    isCashier: zod_1.z.boolean().default(false),
    googleId: zod_1.z.string().min(1, "Google Id cannot be empty!"),
    email: zod_1.z.email("Invalid email format"),
    image: zod_1.z.url("Invalid image url"),
    username: zod_1.z.string().min(1, "Username is empty"),
});
//# sourceMappingURL=auth.schema.js.map