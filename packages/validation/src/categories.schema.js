"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCategorySchema = void 0;
const zod_1 = require("zod");
exports.createCategorySchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(1, "Category name is required!")
        .min(3, "Category name should be minimum of length 2")
        .max(50, "Category name is too long!"),
});
//# sourceMappingURL=categories.schema.js.map