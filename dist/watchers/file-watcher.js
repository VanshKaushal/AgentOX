"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileWatcher = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const store_1 = require("../store");
const IGNORE_PATTERNS = [
    'node_modules', '.git', 'dist', 'build',
    '.next', '__pycache__', 'agentos', '.claude',
    '.cursor', '.env', '*.log', '.DS_Store',
    'thumbs.db', '*.tgz', '*.lock'
];
function shouldIgnore(filePath) {
    return IGNORE_PATTERNS.some(p => {
        if (p.startsWith('*')) {
            return filePath.endsWith(p.slice(1));
        }
        return filePath.includes(p);
    });
}
function hashFile(fp) {
    try {
        return crypto_1.default.createHash('sha256')
            .update(fs_1.default.readFileSync(fp))
            .digest('hex').slice(0, 12);
    }
    catch {
        return 'deleted';
    }
}
function scanFolder(dir) {
    const result = new Map();
    function walk(current) {
        try {
            for (const entry of fs_1.default.readdirSync(current, { withFileTypes: true })) {
                const full = path_1.default.join(current, entry.name);
                const rel = path_1.default.relative(dir, full);
                if (shouldIgnore(rel))
                    continue;
                if (entry.isDirectory()) {
                    walk(full);
                    continue;
                }
                result.set(rel, hashFile(full));
            }
        }
        catch { }
    }
    walk(dir);
    return result;
}
class FileWatcher {
    dir;
    prev;
    timer = null;
    debounce;
    active = true;
    constructor(dir, debounceMs = 4000) {
        this.dir = dir;
        this.debounce = debounceMs;
        this.prev = scanFolder(dir);
        console.log(`👁  AgentOX watching: ${path_1.default.basename(dir)}`);
        console.log('    No git needed. All file changes tracked.');
        console.log('    Press Ctrl+C to stop.\n');
    }
    start() {
        try {
            fs_1.default.watch(this.dir, { recursive: true }, (_, filename) => {
                if (!filename || shouldIgnore(filename))
                    return;
                if (this.timer)
                    clearTimeout(this.timer);
                this.timer = setTimeout(() => this.processChanges(), this.debounce);
            });
        }
        catch (e) {
            console.error('Watch failed:', e.message);
        }
    }
    processChanges() {
        if (!this.active)
            return;
        const current = scanFolder(this.dir);
        const added = [];
        const modified = [];
        const deleted = [];
        current.forEach((hash, fp) => {
            const prev = this.prev.get(fp);
            if (!prev)
                added.push(fp);
            else if (prev !== hash)
                modified.push(fp);
        });
        this.prev.forEach((_, fp) => {
            if (!current.has(fp))
                deleted.push(fp);
        });
        if (!added.length && !modified.length && !deleted.length)
            return;
        this.prev = current;
        const allFiles = [...modified, ...added, ...deleted].slice(0, 15);
        const parts = [];
        if (modified.length)
            parts.push(`${modified.length} modified`);
        if (added.length)
            parts.push(`${added.length} added`);
        if (deleted.length)
            parts.push(`${deleted.length} deleted`);
        const summary = parts.join(', ');
        let agent = 'unknown';
        try {
            agent = store_1.store.readState().active_agent;
        }
        catch { }
        const entry = {
            timestamp: new Date().toISOString(),
            agent,
            files_changed: allFiles,
            summary,
            accepted: true,
            session_id: crypto_1.default.randomUUID()
        };
        try {
            store_1.store.appendLog(entry);
            console.log(`✓ [${new Date().toLocaleTimeString()}] ${summary}`);
            const show = [...modified, ...added].slice(0, 3);
            if (show.length)
                console.log(`   ${show.join(', ')}${allFiles.length > 3 ? '...' : ''}`);
        }
        catch (e) {
            console.log('⚠ Could not log:', e.message);
        }
    }
    stop() {
        this.active = false;
        if (this.timer)
            clearTimeout(this.timer);
        console.log('\n✓ AgentOX file watcher stopped.');
    }
}
exports.FileWatcher = FileWatcher;
