Read package.json, src/commands/init.ts, 
src/commands/log-commit.ts, src/index.ts.

━━━ FIX 1: package.json — control published files ━━━

Replace or add "files" field in package.json with:

"files": [
  "dist/",
  "README.md"
]

This ensures ONLY dist/ and README.md go to npm.
Nothing else. No src/, no agentos/, no docs/.

Also verify:
"version": "0.1.2"
"bin": { "agentox": "./dist/index.js" }

━━━ FIX 2: .npmignore — create this file in root ━━━

Create .npmignore in repo root with:

# Source
src/
tsconfig.json

# Test and dev files
test*.txt
test*.ts
test*.js
e2e*.ps1
m.md
*.tgz

# User data — never ship
agentos/
.agentosignore

# VSCode extension — separate project
agentos-vscode/

# Docs
docs/

# Git
.git/
.gitignore

# Environment
.env
.env.*
node_modules/

━━━ FIX 3: src/commands/init.ts — ENOENT crash ━━━

The init command crashes because it tries to write
execution_log.jsonl before creating the agentos/ folder.

Find store.ensureDir() call in init.ts.
It must be called FIRST before any file writes.

Verify ensureDir() in store.ts creates ALL these:
- agentos/
- agentos/snapshots/
- agentos/summaries/

If any mkdir is missing, add:
const dirs = [
  path.join(ROOT(), 'snapshots'),
  path.join(ROOT(), 'summaries')
];
dirs.forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, {recursive:true});
});

━━━ FIX 4: src/index.ts — register agentox log ━━━

Find imports section. Add if missing:
import { logPublicCmd } from './commands/log-commit';

Find program.addCommand section. Add if missing:
program.addCommand(logPublicCmd());

━━━ FIX 5: src/mcp/server.ts — cwd in serve config ━━━

The serve config hardcodes cwd to the AgentOS 
REPO folder not the USER's project folder.

In serve.ts config command:
Replace:
  cwd: cwd  (where cwd = process.cwd())

With nothing — remove cwd entirely from config output:
const config = {
  mcpServers: {
    agentox: {
      command: 'agentox',
      args: ['serve', 'start']
    }
  }
};

The MCP server will use whatever folder it's 
launched from. No hardcoded path.

━━━ AFTER ALL FIXES ━━━

npm run build

Then verify package contents:
npm pack --dry-run

Expected files (roughly):
- README.md
- dist/audit.js
- dist/bootstrap.js
- dist/commands/*.js (~15 files)
- dist/index.js
- dist/mcp/server.js
- dist/schema.js
- dist/store.js
- dist/templates.js
- package.json
TOTAL: ~25 files max. Under 20KB.

NO agentos/ folder.
NO src/ folder.
NO test files.
NO docs/.
NO *.tgz.