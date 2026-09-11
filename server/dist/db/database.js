"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = exports.default = void 0;
// Re-export supabase client for convenience
// The old JsonDB class has been replaced by Supabase PostgreSQL
var supabase_1 = require("./supabase");
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return supabase_1.supabase; } });
Object.defineProperty(exports, "supabase", { enumerable: true, get: function () { return supabase_1.supabase; } });
