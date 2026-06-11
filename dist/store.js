"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.store = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function findRoot() {
    let current = process.cwd();
    while (current !== path_1.default.dirname(current)) {
        if (fs_1.default.existsSync(path_1.default.join(current, 'agentos', 'state.json')))
            return path_1.default.join(current, 'agentos');
        current = path_1.default.dirname(current);
    }
    return path_1.default.join(process.cwd(), 'agentos');
}
const ROOT = () => findRoot();
const p = (file) => path_1.default.join(ROOT(), file);
exports.store = {
    getRootDir() { return path_1.default.dirname(ROOT()); },
    exists() { return fs_1.default.existsSync(ROOT()); },
    readState() { return JSON.parse(fs_1.default.readFileSync(p('state.json'), 'utf8')); },
    writeState(s) { fs_1.default.writeFileSync(p('state.json'), JSON.stringify(s, null, 2)); },
    readDecisions() { return JSON.parse(fs_1.default.readFileSync(p('decisions.json'), 'utf8')); },
    writeDecisions(d) { fs_1.default.writeFileSync(p('decisions.json'), JSON.stringify(d, null, 2)); },
    readArchMap() { return JSON.parse(fs_1.default.readFileSync(p('architecture_map.json'), 'utf8')); },
    writeArchMap(a) { fs_1.default.writeFileSync(p('architecture_map.json'), JSON.stringify(a, null, 2)); },
    readTaskGraph() { return JSON.parse(fs_1.default.readFileSync(p('task_graph.json'), 'utf8')); },
    writeTaskGraph(t) { fs_1.default.writeFileSync(p('task_graph.json'), JSON.stringify(t, null, 2)); },
    appendLog(entry) {
        fs_1.default.appendFileSync(p('execution_log.jsonl'), JSON.stringify(entry) + '\n');
    },
    readLog(last = 10) {
        if (!fs_1.default.existsSync(p('execution_log.jsonl')))
            return [];
        const lines = fs_1.default.readFileSync(p('execution_log.jsonl'), 'utf8').trim().split('\n').filter(Boolean);
        return lines.slice(-last).map(l => JSON.parse(l));
    },
    ensureDir() {
        if (!fs_1.default.existsSync(ROOT()))
            fs_1.default.mkdirSync(ROOT(), { recursive: true });
        const snaps = path_1.default.join(ROOT(), 'snapshots');
        if (!fs_1.default.existsSync(snaps))
            fs_1.default.mkdirSync(snaps);
        const sums = path_1.default.join(ROOT(), 'summaries');
        if (!fs_1.default.existsSync(sums))
            fs_1.default.mkdirSync(sums);
    }
};
