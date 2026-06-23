Read src/commands/push.ts and src/commands/cloud-pull.ts

━━━ FIX 1: Environment-based URL ━━━

Replace hardcoded localhost URL in push.ts:
const BASE_URL = process.env.AGENTOX_API_URL 
  || 'http://localhost:3000';

const res = await fetch(`${BASE_URL}/api/sync`, {
  ...
});

Same fix in cloud-pull.ts:
const BASE_URL = process.env.AGENTOX_API_URL 
  || 'http://localhost:3000';

const res = await fetch(
  `${BASE_URL}/api/pull?project=${projectName}`,
  ...
);

This means:
Local testing: points to localhost:3000 (default)
Production: set AGENTOX_API_URL=https://agentox.dev

━━━ FIX 2: Auto-push on agentox snapshot ━━━

Read src/commands/snapshot.ts

At the END of the snapshot action(), after saving file:

// Auto-push to cloud if token available
const token = process.env.AGENTOX_TOKEN;
if (token) {
  try {
    const BASE_URL = process.env.AGENTOX_API_URL 
      || 'http://localhost:3000';
    const state = store.readState();
    const tasks = store.readTaskGraph();
    const decisions = store.readDecisions();
    const history = store.readLog(20);
    const path = require('path');
    
    fetch(`${BASE_URL}/api/sync`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        project_name: path.basename(process.cwd()),
        state, tasks, decisions, history
      })
    }).then(r => {
      if (r.ok) console.log('☁ Context auto-synced to cloud');
    }).catch(() => {}); // silent fail — don't block user
  } catch {}
}

This means: if AGENTOX_TOKEN is set,
every agentox snapshot auto-pushes silently.
No extra command needed.

━━━ FIX 3: agentox switch also auto-pushes ━━━

Same block at end of switch.ts action().
After generating bootstrap prompt, if token exists,
auto-push silently.

REBUILD: npm run build

VERIFY:
set AGENTOX_TOKEN=test_token
# Start cloud: npm run dev in agentox-cloud/

agentox snapshot
# Must show: ☁ Context auto-synced to cloud

agentox switch cursor  
# Must show: ☁ Context auto-synced to cloud
# (after the bootstrap prompt)

No manual agentox push needed anymore.