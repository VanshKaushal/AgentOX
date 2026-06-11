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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePdf = parsePdf;
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
async function parsePdf(filePath) {
    return new Promise((resolve) => {
        const pythonScript = path.join(__dirname, 'pdf.py');
        // Execute python, passing the script and the target file path
        (0, child_process_1.execFile)('python', [pythonScript, filePath], (error, stdout, stderr) => {
            if (error && !stdout) {
                return resolve({
                    success: false,
                    error: `Failed to execute python script: ${error.message}. stderr: ${stderr}`
                });
            }
            try {
                const result = JSON.parse(stdout.trim());
                resolve(result);
            }
            catch (parseError) {
                resolve({
                    success: false,
                    error: `Failed to parse Python script output: ${parseError.message}. Output: ${stdout}`
                });
            }
        });
    });
}
