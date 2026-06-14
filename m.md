Read src/index.ts and src/mcp/server.ts.

FIX 1 — src/index.ts line 19:
Replace:
  program.name('agentox').description('Cross-agent continuity layer').version('0.1.1');
With:
  const pkg = require('../package.json');
  program.name('agentox').description('Cross-agent continuity layer').version(pkg.version);

FIX 2 — src/mcp/server.ts line 15:
Replace:
  { name: 'agentox', version: '0.1.1' },
With:
  { name: 'agentox', version: require('../../package.json').version },

Only these two changes. Nothing else.