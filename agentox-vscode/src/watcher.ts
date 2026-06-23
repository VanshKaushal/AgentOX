import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { AgentOXProvider } from './provider';
import { AgentOXStatusBar } from './statusbar';

export class AgentOXWatcher {
  private ws: string;
  private provider: AgentOXProvider;
  private statusBar: AgentOXStatusBar;
  private timer: NodeJS.Timeout | null = null;
  private pending = false;
  private watcher: vscode.FileSystemWatcher | null = null;
  private fileHashes = new Map<string, string>();
  private pendingChanges: string[] = [];

  constructor(ws: string, p: AgentOXProvider, sb: AgentOXStatusBar) {
    this.ws = ws;
    this.provider = p;
    this.statusBar = sb;
  }

  private hashFile(fp: string): string {
    try {
      return crypto.createHash('sha256')
        .update(fs.readFileSync(fp))
        .digest('hex').slice(0,8);
    } catch { return 'deleted'; }
  }

  private initHashes() {
    const ignore = ['node_modules','.git','dist','agentos'];
    function walk(dir: string, ws: string, 
      map: Map<string,string>, self: any) {
      try {
        for (const e of fs.readdirSync(dir,{withFileTypes:true})) {
          if (ignore.some(i => e.name.includes(i))) continue;
          const full = path.join(dir, e.name);
          const rel = path.relative(ws, full);
          if (e.isDirectory()) { walk(full, ws, map, self); continue; }
          map.set(rel, self.hashFile(full));
        }
      } catch {}
    }
    walk(this.ws, this.ws, this.fileHashes, this);
  }

  start() {
    this.statusBar.setWatching(true);
    // Scan existing files on startup
    this.initHashes();
    
    // Watch all files in workspace
    this.watcher = vscode.workspace.createFileSystemWatcher('**/*');
    this.watcher.onDidChange((uri) => this.onFileSaved(uri.fsPath));
    this.watcher.onDidCreate((uri) => this.onFileSaved(uri.fsPath));
    this.watcher.onDidDelete((uri) => this.onFileSaved(uri.fsPath));
  }

  onFileSaved(filePath: string) {
    // Ignore agentox internals and node_modules
    const rel = path.relative(this.ws, filePath);
    if (rel.includes('agentos') || 
        rel.includes('node_modules') ||
        rel.includes('.git') ||
        rel.includes('dist')) return;

    const newHash = this.hashFile(filePath);
    const oldHash = this.fileHashes.get(rel) || '';
    
    if (newHash !== oldHash) {
      this.fileHashes.set(rel, newHash);
      if (!this.pendingChanges.includes(rel)) {
        this.pendingChanges.push(rel);
      }
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(() => this.flushChanges(), 3000);
    }
  }

  private flushChanges() {
    if (this.pendingChanges.length === 0) return;
    const files = [...this.pendingChanges];
    this.pendingChanges = [];

    // Write directly to execution_log.jsonl
    const logPath = path.join(this.ws, 'agentos', 'execution_log.jsonl');
    if (!fs.existsSync(logPath)) return;

    let agent = 'unknown';
    try {
      const state = JSON.parse(
        fs.readFileSync(path.join(this.ws, 'agentos', 'state.json'), 'utf8')
      );
      agent = state.active_agent || 'unknown';
    } catch {}

    const entry = {
      timestamp: new Date().toISOString(),
      agent,
      files_changed: files.slice(0, 15),
      summary: `IDE: ${files.length} file(s) saved — ${files.slice(0,3).join(', ')}${files.length > 3 ? '...' : ''}`,
      accepted: true,
      session_id: require('crypto').randomUUID()
    };

    try {
      fs.appendFileSync(logPath, JSON.stringify(entry) + '\n');
      this.provider.refresh();
      // Show subtle notification only if many files changed
      if (files.length > 3) {
        vscode.window.setStatusBarMessage(
          `AgentOX: logged ${files.length} changes`, 3000
        );
      }
    } catch(e) {
      console.error('AgentOX log failed:', e);
    }
  }

  stop() {
    this.watcher?.dispose();
    if (this.timer) clearTimeout(this.timer);
    this.statusBar.setWatching(false);
  }
}
