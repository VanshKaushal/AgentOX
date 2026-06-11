"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.watchCmd = watchCmd;
const commander_1 = require("commander");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
function watchCmd() {
    return new commander_1.Command('watch')
        .description('Auto-log commits in background (no hook needed)')
        .action(() => {
        const gitDir = path_1.default.join(process.cwd(), '.git');
        const headFile = path_1.default.join(gitDir, 'COMMIT_EDITMSG');
        if (!fs_1.default.existsSync(gitDir)) {
            console.error('Not a git repo');
            process.exit(1);
        }
        console.log('👁  AgentOS watching for commits...');
        console.log('   Every commit will be auto-logged.');
        console.log('   Press Ctrl+C to stop.\n');
        let lastContent = '';
        try {
            lastContent = fs_1.default.readFileSync(headFile, 'utf8');
        }
        catch { }
        // Watch COMMIT_EDITMSG — changes on every commit
        fs_1.default.watch(gitDir, { recursive: false }, (event, filename) => {
            if (filename !== 'COMMIT_EDITMSG')
                return;
            try {
                const content = fs_1.default.readFileSync(headFile, 'utf8');
                if (content === lastContent)
                    return;
                lastContent = content;
                // Small delay to ensure commit is complete
                setTimeout(() => {
                    try {
                        (0, child_process_1.execSync)('agentox _log-commit', {
                            cwd: process.cwd(),
                            stdio: 'pipe'
                        });
                        const msg = content.trim().slice(0, 50);
                        console.log(`✓ Auto-logged: "${msg}"`);
                    }
                    catch (e) {
                        console.log('⚠ Auto-log failed:', e.message);
                    }
                }, 500);
            }
            catch { }
        });
        // Keep process alive
        process.stdin.resume();
        process.on('SIGINT', () => {
            console.log('\n✓ AgentOS watch stopped.');
            process.exit(0);
        });
    });
}
