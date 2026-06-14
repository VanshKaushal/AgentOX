Read src/commands/init.ts ONLY.

The store.ensureDir() call is broken/unreliable.
Replace it with inline directory creation directly 
in init.ts action() — do not rely on store.ensureDir().

Replace the line:
  store.ensureDir();

With these lines:

const agentosDir = path.join(process.cwd(), 'agentos');
const snapshotsDir = path.join(agentosDir, 'snapshots');
const summariesDir = path.join(agentosDir, 'summaries');

if (!fs.existsSync(agentosDir)) {
  fs.mkdirSync(agentosDir, { recursive: true });
}
if (!fs.existsSync(snapshotsDir)) {
  fs.mkdirSync(snapshotsDir, { recursive: true });
}
if (!fs.existsSync(summariesDir)) {
  fs.mkdirSync(summariesDir, { recursive: true });
}

Do not change anything else in the file.
Do not remove store.ensureDir() from store.ts.
Just replace that one line in init.ts.

After: npm run build

Verify:
node dist/index.js init
from inside a fresh folder with git init done.
Must show zero ENOENT errors.