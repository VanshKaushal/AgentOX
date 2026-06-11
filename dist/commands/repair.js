"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.repairCmd = repairCmd;
const commander_1 = require("commander");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const schema_1 = require("../schema");
function repairCmd() {
    return new commander_1.Command('repair')
        .description('Repair corrupted or missing AgentOS state files')
        .action(() => {
        try {
            const ROOT = path_1.default.join(process.cwd(), 'agentos');
            if (!fs_1.default.existsSync(ROOT)) {
                console.error('AgentOS is not initialized. Run: agentos init');
                process.exit(1);
            }
            const files = [
                { name: 'state.json', default: (0, schema_1.defaultState)() },
                { name: 'decisions.json', default: (0, schema_1.defaultDecisions)() },
                { name: 'task_graph.json', default: (0, schema_1.defaultTaskGraph)() },
                { name: 'architecture_map.json', default: (0, schema_1.defaultArchMap)() },
                { name: 'execution_log.jsonl', default: '', isJsonl: true }
            ];
            let repaired = 0;
            console.log('\n── AgentOS Repair ──────────────────');
            for (const file of files) {
                const p = path_1.default.join(ROOT, file.name);
                if (!fs_1.default.existsSync(p)) {
                    const content = typeof file.default === 'string' ? file.default : JSON.stringify(file.default, null, 2);
                    fs_1.default.writeFileSync(p, content);
                    console.log(`! [${file.name}] Missing -> Recreated with defaults`);
                    repaired++;
                    continue;
                }
                try {
                    const content = fs_1.default.readFileSync(p, 'utf8');
                    if (!file.isJsonl) {
                        JSON.parse(content); // Validate JSON
                    }
                    console.log(`✓ [${file.name}] OK`);
                }
                catch (e) {
                    fs_1.default.copyFileSync(p, `${p}.corrupted`);
                    const content = typeof file.default === 'string' ? file.default : JSON.stringify(file.default, null, 2);
                    fs_1.default.writeFileSync(p, content);
                    console.log(`! [${file.name}] Corrupted -> Backed up to .corrupted, recreated with defaults`);
                    repaired++;
                }
            }
            console.log('────────────────────────────────────');
            if (repaired > 0) {
                console.log(`Repair complete. ${repaired} file(s) repaired.\n`);
            }
            else {
                console.log(`All state files are healthy.\n`);
            }
        }
        catch (e) {
            console.error(`Error in repair: ${e.message}`);
            process.exit(1);
        }
    });
}
