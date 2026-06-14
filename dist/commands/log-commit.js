"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logCommitCmd = logCommitCmd;
exports.logPublicCmd = logPublicCmd;
const commander_1 = require("commander");
const child_process_1 = require("child_process");
const store_1 = require("../store");
const crypto_1 = __importDefault(require("crypto"));
function logCommitCmd() {
    return new commander_1.Command('_log-commit')
        .description('Internal: called by git post-commit hook')
        .action(() => {
        if (!store_1.store.exists())
            return; // not initialized, skip silently
        // Get changed files from last commit
        let filesChanged = [];
        try {
            const diff = (0, child_process_1.execSync)('git show --name-only --pretty=format: HEAD', { encoding: 'utf8' });
            filesChanged = diff.trim().split('\n').filter(Boolean);
        }
        catch {
            return;
        } // first commit edge case
        // Read .agentosignore and filter
        let ignorePatterns = [];
        try {
            const rootDir = store_1.store.getRootDir();
            const ig = require('fs').readFileSync(require('path').join(rootDir, '.agentosignore'), 'utf8');
            ignorePatterns = ig.split('\n').filter((l) => l.trim() && !l.startsWith('#'));
        }
        catch { }
        filesChanged = filesChanged.filter(f => !ignorePatterns.some(p => f.startsWith(p.replace('/', ''))));
        filesChanged = filesChanged.filter(f => !f.startsWith('agentos/'));
        filesChanged = filesChanged.filter(f => f !== '.agentosignore');
        if (filesChanged.length === 0)
            return; // nothing relevant changed
        let commitMsg = '';
        try {
            commitMsg = (0, child_process_1.execSync)('git log -1 --pretty=format:%s', { encoding: 'utf8' }).trim();
        }
        catch { }
        const state = store_1.store.readState();
        const entry = {
            timestamp: new Date().toISOString(),
            agent: state.active_agent,
            files_changed: filesChanged,
            commit_message: commitMsg,
            summary: commitMsg || `${filesChanged.length} file(s) changed: ${filesChanged.slice(0, 3).join(', ')}${filesChanged.length > 3 ? '...' : ''}`,
            accepted: true,
            session_id: crypto_1.default.randomUUID()
        };
        store_1.store.appendLog(entry);
    });
}
function logPublicCmd() {
    return new commander_1.Command('log')
        .description('View recent execution log')
        .action(() => {
        if (!store_1.store.exists()) {
            console.log('Not initialized. Run: agentox init');
            return;
        }
        const logs = store_1.store.readLog(20);
        if (logs.length === 0) {
            console.log('No logs found.');
            return;
        }
        logs.forEach(l => {
            console.log(`[${l.timestamp}] ${l.agent || 'user'}: ${l.summary}`);
        });
    });
}
