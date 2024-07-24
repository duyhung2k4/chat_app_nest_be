"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COLUMN_TABLE = exports.COLUMN_BASE = void 0;
exports.COLUMN_BASE = ["id", "created_at", "updated_at", "deleted_at"];
exports.COLUMN_TABLE = {
    roles: [...exports.COLUMN_BASE, "name", "code"],
    user: [...exports.COLUMN_BASE, "email", "role_id", "password", "active"],
    profiles: [...exports.COLUMN_BASE, "first_name", "last_name", "email", "address", "gender", "age", "user_id"]
};
//# sourceMappingURL=table.js.map