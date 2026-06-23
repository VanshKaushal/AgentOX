"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.watchCmd = watchCmd;
const commander_1 = require("commander");
const file_watcher_1 = require("../watchers/file-watcher");
const store_1 = require("../store");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const repo_scanner_1 = require("../scanners/repo-scanner");
function watchCmd() {
    return new commander_1.Command('watch')
        .description('Auto-track file changes (no git required)')
        .option('--debounce <ms>', 'Debounce delay in ms', '4000')
        .action((opts) => {
        if (!store_1.store.exists()) {
            console.log('📁 No AgentOX found. Auto-initializing...');
            // Create dirs
            const agentosDir = path_1.default.join(process.cwd(), 'agentos');
            const dirs = [agentosDir,
                path_1.default.join(agentosDir, 'snapshots'),
                path_1.default.join(agentosDir, 'summaries')];
            dirs.forEach(d => {
                if (!fs_1.default.existsSync(d))
                    fs_1.default.mkdirSync(d, { recursive: true });
            });
            // Write defaults
            const { defaultState, defaultDecisions, defaultTaskGraph, defaultArchMap } = require('../schema');
            const statePath = path_1.default.join(agentosDir, 'state.json');
            const logPath = path_1.default.join(agentosDir, 'execution_log.jsonl');
            if (!fs_1.default.existsSync(statePath))
                fs_1.default.writeFileSync(statePath, JSON.stringify(defaultState(), null, 2));
            if (!fs_1.default.existsSync(path_1.default.join(agentosDir, 'decisions.json')))
                fs_1.default.writeFileSync(path_1.default.join(agentosDir, 'decisions.json'), JSON.stringify(defaultDecisions(), null, 2));
            if (!fs_1.default.existsSync(path_1.default.join(agentosDir, 'task_graph.json')))
                fs_1.default.writeFileSync(path_1.default.join(agentosDir, 'task_graph.json'), JSON.stringify(defaultTaskGraph(), null, 2));
            const repoCtx = (0, repo_scanner_1.scanRepo)(process.cwd());
            fs_1.default.writeFileSync(path_1.default.join(agentosDir, 'architecture_map.json'), JSON.stringify(repoCtx, null, 2));
            console.log(`✓ Detected: ${repoCtx.language} / ${repoCtx.framework}`);
            if (!fs_1.default.existsSync(logPath))
                fs_1.default.writeFileSync(logPath, '');
            console.log('✓ AgentOX ready (run agentox init for full setup)\n');
        }
        const debounce = parseInt(opts.debounce) || 4000;
        const watcher = new file_watcher_1.FileWatcher(process.cwd(), debounce);
        watcher.start();
        process.stdin.resume();
        process.on('SIGINT', () => { watcher.stop(); process.exit(0); });
        process.on('SIGTERM', () => { watcher.stop(); process.exit(0); });
    });
}
