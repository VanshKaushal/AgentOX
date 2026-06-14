Read src/commands/init.ts and src/store.ts.

BUG: agentox init crashes with ENOENT because
agentos/snapshots/ and agentos/summaries/ folders
are not created before files are written to them.

FIX in src/store.ts — find ensureDir() function.
Replace entire ensureDir() with:

ensureDir(): void {
  const dirs = [
    ROOT(),
    path.join(ROOT(), 'snapshots'),
    path.join(ROOT(), 'summaries')
  ];
  dirs.forEach(d => {
    if (!fs.existsSync(d)) {
      fs.mkdirSync(d, { recursive: true });
    }
  });
},

FIX in src/commands/init.ts — find the action() function.
The VERY FIRST LINE inside action() must be:
  store.ensureDir();

Before any other operation including MCP config writes.
Move store.ensureDir() to be line 1 of the action body.

After fix:
npm run build
node dist/index.js --version
# Must show: 0.1.4

Then test:
mkdir C:\testfix && cd C:\testfix
git init
git commit --allow-empty -m "start"
agentox init
# Must show success with NO ENOENT error
agentox switch cursor
# Must NOT crash on snapshots folder