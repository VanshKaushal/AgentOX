Read src/commands/serve.ts and README.md.

━━━ FIX 1: PID orphan bug ━━━

In serve.ts stop command, replace the action with:

.action(() => {
  const pidFile = path.join(
    process.cwd(), 'agentos', '.mcp.pid'
  );
  if (!fs.existsSync(pidFile)) {
    console.log('No MCP server PID file found.');
    console.log('Server may not be running.');
    return;
  }
  try {
    const pid = parseInt(fs.readFileSync(pidFile,'utf8').trim());
    // Check if process actually alive
    try {
      process.kill(pid, 0); // signal 0 = check only
      process.kill(pid);    // actually kill it
      fs.unlinkSync(pidFile);
      console.log(`✓ MCP server stopped (PID ${pid})`);
    } catch {
      // Process already dead — clean up stale PID file
      fs.unlinkSync(pidFile);
      console.log('✓ Cleaned up stale PID file.');
      console.log('  Server was already stopped.');
    }
  } catch(e) {
    console.log('Failed to stop:', (e as Error).message);
  }
})

━━━ FIX 2: README MCP compatibility table ━━━

Add this section to README.md after the install section:

## IDE Compatibility

| IDE / Tool | MCP Auto | Bootstrap Fallback |
|------------|----------|--------------------|
| Claude Code | ✅ Native | ✅ |
| Cursor | ✅ Native | ✅ |
| Windsurf | ✅ Native | ✅ |
| Antigravity | ✅ (via MCP config) | ✅ |
| VS Code + Copilot | ❌ (needs Cline/RooCode) | ✅ |
| ChatGPT | ❌ | ✅ |
| Any other AI | ❌ | ✅ |

**AgentOX works everywhere via Bootstrap fallback.
MCP gives you zero-paste automation in supported IDEs.**

━━━ FIX 3: agentox serve start — add startup message ━━━

In serve.ts start command before startMcpServer():
Add:
console.error('━━━ AgentOX MCP Server ━━━');
console.error('Status: running');
console.error('Mode: stdio (for Claude Code / Cursor)');
console.error('Tools available: 13');
console.error('Run "agentox serve config" to get');
console.error('the config JSON for your IDE.');
console.error('Press Ctrl+C to stop.');
console.error('━━━━━━━━━━━━━━━━━━━━━━━━━');

━━━ AFTER FIXES ━━━
npm run build → 0 errors
npm version patch  → bumps to 0.1.2
npm publish --access public