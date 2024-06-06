"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.predefinedFunctions = void 0;
const mime = __importStar(require("mime-types"));
const uuid_1 = require("uuid");
const Vocabulary_1 = require("./util/Vocabulary");
function toBoolean(val) {
    if ((typeof val === 'string' && val === 'true') ||
        (typeof val === 'boolean' && val)) {
        return true;
    }
    return false;
}
exports.predefinedFunctions = {
    [Vocabulary_1.GREL.array_length](data) {
        const arr = Array.isArray(data[Vocabulary_1.GREL.p_array_a]) ? data[Vocabulary_1.GREL.p_array_a] : [data[Vocabulary_1.GREL.p_array_a]];
        return arr.length;
    },
    [Vocabulary_1.GREL.array_join](data) {
        const separator = data[Vocabulary_1.GREL.p_string_sep];
        const parts = Array.isArray(data[Vocabulary_1.GREL.p_array_a])
            ? data[Vocabulary_1.GREL.p_array_a]
            : [data[Vocabulary_1.GREL.p_array_a]];
        return parts
            // RML mapper returns empty arrays for undefined values
            .filter((part) => !(Array.isArray(part) && part.length === 0))
            .join(separator ?? '');
    },
    [Vocabulary_1.GREL.controls_if](data) {
        if ((typeof data[Vocabulary_1.GREL.bool_b] === 'string' && data[Vocabulary_1.GREL.bool_b] === 'true') ||
            (typeof data[Vocabulary_1.GREL.bool_b] === 'boolean' && data[Vocabulary_1.GREL.bool_b])) {
            return data[Vocabulary_1.GREL.any_true];
        }
        return data[Vocabulary_1.GREL.any_false] || undefined;
    },
    [Vocabulary_1.GREL.string_endsWith](data) {
        const string = data[Vocabulary_1.GREL.valueParameter];
        const suffix = data[Vocabulary_1.GREL.string_sub];
        return typeof string === 'string' && string.endsWith(suffix);
    },
    [Vocabulary_1.GREL.string_replace](data) {
        const string = data[Vocabulary_1.GREL.valueParameter];
        const replace = data[Vocabulary_1.GREL.p_string_find];
        const value = data[Vocabulary_1.GREL.p_string_replace];
        return string.replace(replace, value);
    },
    [Vocabulary_1.GREL.toUpperCase](data) {
        return data[0].toString().toUpperCase();
    },
    [Vocabulary_1.GREL.date_now]() {
        return new Date().toISOString();
    },
    [Vocabulary_1.GREL.date_inc](data) {
        if (typeof data[Vocabulary_1.GREL.p_date_d] === 'string') {
            const fromDate = new Date(data[Vocabulary_1.GREL.p_date_d]);
            const toDate = new Date(fromDate.getTime());
            const change = Number.parseInt(data[Vocabulary_1.GREL.p_dec_n], 10);
            if (data[Vocabulary_1.GREL.p_string_unit] === 'year') {
                toDate.setFullYear(fromDate.getFullYear() + change);
            }
            else if (data[Vocabulary_1.GREL.p_string_unit] === 'month') {
                toDate.setMonth(fromDate.getMonth() + change);
            }
            else if (data[Vocabulary_1.GREL.p_string_unit] === 'day') {
                toDate.setDate(fromDate.getDate() + change);
            }
            else if (data[Vocabulary_1.GREL.p_string_unit] === 'hour') {
                toDate.setHours(fromDate.getHours() + change);
            }
            else if (data[Vocabulary_1.GREL.p_string_unit] === 'minute') {
                toDate.setMinutes(fromDate.getMinutes() + change);
            }
            else if (data[Vocabulary_1.GREL.p_string_unit] === 'second') {
                toDate.setSeconds(fromDate.getSeconds() + change);
            }
            return toDate.toISOString();
        }
        return '';
    },
    [Vocabulary_1.GREL.array_sum](data) {
        const values = data[Vocabulary_1.GREL.p_array_a];
        if (Array.isArray(values)) {
            return values.reduce((sum, num) => sum + Number.parseFloat(num), 0);
        }
        return Number.parseFloat(values);
    },
    // Note: this is not in the GREL spec
    // it follows the same params syntax as array sum
    [Vocabulary_1.GREL.array_product](data) {
        const values = data[Vocabulary_1.GREL.p_array_a];
        if (Array.isArray(values)) {
            return values.reduce((product, num) => product * Number.parseFloat(num), 1);
        }
        return Number.parseFloat(values);
    },
    [Vocabulary_1.GREL.boolean_not](data) {
        return !toBoolean(data[Vocabulary_1.GREL.bool_b]);
    },
    [Vocabulary_1.GREL.boolean_and](values) {
        return values.every((val) => toBoolean(val));
    },
    [Vocabulary_1.GREL.boolean_or](values) {
        return values.some((val) => toBoolean(val));
    },
    [Vocabulary_1.GREL.array_get](data) {
        const from = Number.parseInt(data[Vocabulary_1.GREL.param_int_i_from], 10);
        if (!data[Vocabulary_1.GREL.param_int_i_opt_to]) {
            return data[Vocabulary_1.GREL.p_array_a][from];
        }
        const to = Number.parseInt(data[Vocabulary_1.GREL.param_int_i_opt_to], 10);
        return data[Vocabulary_1.GREL.p_array_a].slice(from, to);
    },
    [Vocabulary_1.GREL.string_split](data) {
        const value = data[Vocabulary_1.GREL.valueParameter];
        if (Array.isArray(value) && value.length === 0) {
            return [];
        }
        return value.split(data[Vocabulary_1.GREL.p_string_sep]);
    },
    [Vocabulary_1.GREL.string_toString](data) {
        if (typeof data[Vocabulary_1.GREL.p_any_e] === 'object') {
            return JSON.stringify(data[Vocabulary_1.GREL.p_any_e]);
        }
        return data[Vocabulary_1.GREL.p_any_e].toString();
    },
    [Vocabulary_1.GREL.string_toNumber](data) {
        if (data[Vocabulary_1.GREL.p_any_e].includes('.')) {
            return Number.parseFloat(data[Vocabulary_1.GREL.p_any_e]);
        }
        return Number.parseInt(data[Vocabulary_1.GREL.p_any_e], 10);
    },
    [Vocabulary_1.GREL.string_length](data) {
        return data[Vocabulary_1.GREL.valueParameter].length;
    },
    [Vocabulary_1.GREL.string_contains](data) {
        return data[Vocabulary_1.GREL.valueParameter].includes(data[Vocabulary_1.GREL.string_sub]);
    },
    [Vocabulary_1.GREL.math_max](data) {
        return Math.max(Number.parseInt(data[Vocabulary_1.GREL.p_dec_n], 10), Number.parseInt(data[Vocabulary_1.GREL.param_n2], 10));
    },
    [Vocabulary_1.GREL.math_min](data) {
        return Math.min(Number.parseInt(data[Vocabulary_1.GREL.p_dec_n], 10), Number.parseInt(data[Vocabulary_1.GREL.param_n2], 10));
    },
    [Vocabulary_1.GREL.math_ceil](data) {
        return Math.ceil(Number.parseInt(data[Vocabulary_1.GREL.p_dec_n], 10));
    },
    [Vocabulary_1.IDLAB.equal](data) {
        return data[Vocabulary_1.GREL.valueParameter] === data[Vocabulary_1.GREL.valueParameter2];
    },
    [Vocabulary_1.IDLAB.notEqual](data) {
        return data[Vocabulary_1.GREL.valueParameter] !== data[Vocabulary_1.GREL.valueParameter2];
    },
    [Vocabulary_1.IDLAB.getMIMEType](data) {
        return mime.lookup(data[Vocabulary_1.IDLAB.str]);
    },
    [Vocabulary_1.IDLAB.isNull](data) {
        const value = data[Vocabulary_1.IDLAB.str];
        return Array.isArray(value) ? value.length === 0 : !value;
    },
    [Vocabulary_1.IDLAB.random]() {
        return (0, uuid_1.v4)();
    },
    [Vocabulary_1.IDLAB.concat](data) {
        return [
            data[Vocabulary_1.IDLAB.str],
            data[Vocabulary_1.IDLAB.otherStr],
        ]
            .filter((str) => typeof str !== 'object' && (typeof str !== 'string' || str.length > 0))
            .join(data[Vocabulary_1.IDLAB.delimiter] ?? '');
    },
    [Vocabulary_1.IDLAB.listContainsElement](data) {
        return data[Vocabulary_1.IDLAB.list].includes(data[Vocabulary_1.IDLAB.str]);
    },
    [Vocabulary_1.IDLAB.trueCondition](data) {
        if ((typeof data[Vocabulary_1.IDLAB.strBoolean] === 'string' && data[Vocabulary_1.IDLAB.strBoolean] === 'true') ||
            (typeof data[Vocabulary_1.IDLAB.strBoolean] === 'boolean' && data[Vocabulary_1.IDLAB.strBoolean])) {
            return data[Vocabulary_1.IDLAB.str];
        }
        return undefined;
    },
};
//# sourceMappingURL=PredefinedFunctions.js.map