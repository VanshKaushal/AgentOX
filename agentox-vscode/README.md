<div align="center">
  <h1>🐂 AgentOX</h1>
  <p><b>Switch AI agents without re-explaining anything.</b></p>
  
  <p><i>AgentOX silently tracks what every AI builds in your project. Switch effortlessly from VS Code to Cursor, Windsurf, or Antigravity — your context carries over automatically.</i></p>

  <img src="https://via.placeholder.com/800x400/0A0A0A/FFFFFF?text=GIF:+AgentOX+Demo+In+Action" alt="AgentOX Demo" width="100%" style="border-radius: 8px;" />
</div>

---

## ✨ Why AgentOX?

Working with multiple AI tools? You know the pain of constantly re-explaining your project structure, copying and pasting code snippets, and rebuilding context every time you switch from Claude in VS Code to Cursor or Windsurf.

**AgentOX solves this.** It silently tracks your active files, recent changes, and project state in the background. With one click, it bundles everything into a perfect handoff prompt, ready to be pasted into your next AI agent.

---

## 🚀 Key Features

- ⚡ **Instant Context Handoff:** Click "Copy Context" in your status bar to instantly grab a complete, highly-optimized snapshot of your project's current state.
- 🔄 **Cross-IDE Continuity:** Start a project in VS Code, copy the context, and paste it directly into another AI editor. The new AI picks up exactly where the last one stopped!
- 📂 **Zero-Git File Tracking:** AgentOX knows exactly what files were modified by your AI agent, even if you haven't made a single Git commit yet.
- ☁️ **Cloud Sync (Pro):** Sync your active projects to the AgentOX Cloud and pull your context from any machine.

---

## 🛠️ Quick Start

It's completely frictionless. Once installed, it just works.

1. **Install** the extension from the VS Code Marketplace.
2. **Work normally** using your favorite AI extensions (GitHub Copilot, Cline, etc).
3. **Ready to switch?** Look at your bottom-right status bar and click the **`🐂 Copy Context`** button.
4. **Paste** into your new AI agent's chat box. Watch it instantly understand your entire project!

> **💡 Pro Tip:** You can also trigger the handoff by opening the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`) and typing **`AgentOX: Copy Context`**.

---

## ☁️ AgentOX Cloud (Pro)

Want to sync your context across multiple machines or laptops? 

1. Sign up at the [AgentOX Dashboard](https://localhost:3000) (Update link when deployed).
2. Grab your CLI token from the dashboard.
3. Open your VS Code terminal and run:
   ```bash
   set AGENTOX_TOKEN=your_token_here
   agentox push
   ```
4. Your context is now safely in the cloud! Jump on another machine and run `agentox pull` to instantly resume your work.

---

<div align="center">
  <p><i>Built for the era of multi-agent development.</i></p>
</div>
