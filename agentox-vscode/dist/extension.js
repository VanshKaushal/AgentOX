"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode4 = __toESM(require("vscode"));
var fs3 = __toESM(require("fs"));
var path3 = __toESM(require("path"));

// src/provider.ts
var vscode = __toESM(require("vscode"));
var fs = __toESM(require("fs"));
var path = __toESM(require("path"));
var AgentOXProvider = class {
  _onDidChange = new vscode.EventEmitter();
  onDidChangeTreeData = this._onDidChange.event;
  ws;
  ctx;
  constructor(ws, ctx) {
    this.ws = ws;
    this.ctx = ctx;
    const stateFile = path.join(ws, "agentos", "state.json");
    const taskFile = path.join(ws, "agentos", "task_graph.json");
    [stateFile, taskFile].forEach((f) => {
      if (fs.existsSync(f)) {
        fs.watch(f, () => {
          setTimeout(() => this.refresh(), 200);
        });
      }
    });
  }
  refresh() {
    this._onDidChange.fire();
  }
  getTreeItem(el) {
    return el;
  }
  getChildren(el) {
    if (el)
      return el.children || [];
    const aDir = path.join(this.ws, "agentos");
    if (!fs.existsSync(aDir)) {
      return [new AgentItem(
        "Not initialized (Click to setup)",
        "Click to automatically initialize AgentOS",
        [],
        "warning",
        vscode.TreeItemCollapsibleState.None,
        "agentox.initProject"
      )];
    }
    try {
      const state = JSON.parse(
        fs.readFileSync(path.join(aDir, "state.json"), "utf8")
      );
      const tasks = JSON.parse(
        fs.readFileSync(path.join(aDir, "task_graph.json"), "utf8")
      );
      const items = [];
      items.push(new AgentItem(
        `Agent: ${state.active_agent}`,
        "Click to change active agent",
        [],
        "agent",
        vscode.TreeItemCollapsibleState.None,
        "agentox.switchAgent"
      ));
      if (state.objective && !state.objective.includes("Not set")) {
        items.push(new AgentItem(
          `Goal: ${state.objective.slice(0, 50)}`,
          state.objective,
          [],
          "goal"
        ));
      }
      const taskItems = (tasks.pending || []).map(
        (t, i) => new AgentItem(`${i + 1}. ${t}`, "Pending task", [], "task")
      );
      items.push(new AgentItem(
        `Tasks (${tasks.pending?.length || 0} pending)`,
        "Pending tasks",
        taskItems,
        "tasks",
        vscode.TreeItemCollapsibleState.Expanded
      ));
      const drift = state.drift_score || 0;
      items.push(new AgentItem(
        `Drift: ${drift.toFixed(2)} ${drift > 0.4 ? "\u26A0" : "\u2713"}`,
        "How much agent deviated from tasks",
        [],
        "drift"
      ));
      items.unshift(new AgentItem(
        "Switch Agent",
        "Generate handoff prompt and copy to clipboard",
        [],
        "action",
        vscode.TreeItemCollapsibleState.None,
        "agentox.switchAgent"
      ));
      items.unshift(new AgentItem(
        "Copy Context",
        "Copy current context to clipboard for any AI",
        [],
        "action",
        vscode.TreeItemCollapsibleState.None,
        "agentox.copyContext"
      ));
      return items;
    } catch {
      return [new AgentItem(
        "Error reading state",
        "Try: agentox repair",
        [],
        "error"
      )];
    }
  }
};
var AgentItem = class extends vscode.TreeItem {
  children;
  constructor(label, tooltip, children = [], type = "default", collapsible = children.length > 0 ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None, commandId) {
    super(label, collapsible);
    this.tooltip = tooltip;
    this.children = children;
    const icons = {
      agent: "$(robot)",
      goal: "$(target)",
      task: "$(circle-outline)",
      tasks: "$(checklist)",
      drift: "$(pulse)",
      warning: "$(warning)",
      error: "$(error)",
      action: "$(zap)"
    };
    this.description = "";
    this.iconPath = new vscode.ThemeIcon(
      (icons[type] || "$(dot)").replace("$(", "").replace(")", "")
    );
    if (commandId) {
      this.command = {
        command: commandId,
        title: label,
        arguments: []
      };
    }
    this.contextValue = type;
  }
};

// src/watcher.ts
var vscode2 = __toESM(require("vscode"));
var path2 = __toESM(require("path"));
var fs2 = __toESM(require("fs"));
var crypto = __toESM(require("crypto"));
var AgentOXWatcher = class {
  ws;
  provider;
  statusBar;
  timer = null;
  pending = false;
  watcher = null;
  fileHashes = /* @__PURE__ */ new Map();
  pendingChanges = [];
  constructor(ws, p, sb) {
    this.ws = ws;
    this.provider = p;
    this.statusBar = sb;
  }
  hashFile(fp) {
    try {
      return crypto.createHash("sha256").update(fs2.readFileSync(fp)).digest("hex").slice(0, 8);
    } catch {
      return "deleted";
    }
  }
  initHashes() {
    const ignore = ["node_modules", ".git", "dist", "agentos"];
    function walk(dir, ws, map, self) {
      try {
        for (const e of fs2.readdirSync(dir, { withFileTypes: true })) {
          if (ignore.some((i) => e.name.includes(i)))
            continue;
          const full = path2.join(dir, e.name);
          const rel = path2.relative(ws, full);
          if (e.isDirectory()) {
            walk(full, ws, map, self);
            continue;
          }
          map.set(rel, self.hashFile(full));
        }
      } catch {
      }
    }
    walk(this.ws, this.ws, this.fileHashes, this);
  }
  start() {
    this.statusBar.setWatching(true);
    this.initHashes();
    this.watcher = vscode2.workspace.createFileSystemWatcher("**/*");
    this.watcher.onDidChange((uri) => this.onFileSaved(uri.fsPath));
    this.watcher.onDidCreate((uri) => this.onFileSaved(uri.fsPath));
    this.watcher.onDidDelete((uri) => this.onFileSaved(uri.fsPath));
  }
  onFileSaved(filePath) {
    const rel = path2.relative(this.ws, filePath);
    if (rel.includes("agentos") || rel.includes("node_modules") || rel.includes(".git") || rel.includes("dist"))
      return;
    const newHash = this.hashFile(filePath);
    const oldHash = this.fileHashes.get(rel) || "";
    if (newHash !== oldHash) {
      this.fileHashes.set(rel, newHash);
      if (!this.pendingChanges.includes(rel)) {
        this.pendingChanges.push(rel);
      }
      if (this.timer)
        clearTimeout(this.timer);
      this.timer = setTimeout(() => this.flushChanges(), 3e3);
    }
  }
  flushChanges() {
    if (this.pendingChanges.length === 0)
      return;
    const files = [...this.pendingChanges];
    this.pendingChanges = [];
    const logPath = path2.join(this.ws, "agentos", "execution_log.jsonl");
    if (!fs2.existsSync(logPath))
      return;
    let agent = "unknown";
    try {
      const state = JSON.parse(
        fs2.readFileSync(path2.join(this.ws, "agentos", "state.json"), "utf8")
      );
      agent = state.active_agent || "unknown";
    } catch {
    }
    const entry = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      agent,
      files_changed: files.slice(0, 15),
      summary: `IDE: ${files.length} file(s) saved \u2014 ${files.slice(0, 3).join(", ")}${files.length > 3 ? "..." : ""}`,
      accepted: true,
      session_id: require("crypto").randomUUID()
    };
    try {
      fs2.appendFileSync(logPath, JSON.stringify(entry) + "\n");
      this.provider.refresh();
      if (files.length > 3) {
        vscode2.window.setStatusBarMessage(
          `AgentOX: logged ${files.length} changes`,
          3e3
        );
      }
    } catch (e) {
      console.error("AgentOX log failed:", e);
    }
  }
  stop() {
    this.watcher?.dispose();
    if (this.timer)
      clearTimeout(this.timer);
    this.statusBar.setWatching(false);
  }
};

// src/statusbar.ts
var vscode3 = __toESM(require("vscode"));
var AgentOXStatusBar = class {
  item;
  constructor() {
    this.item = vscode3.window.createStatusBarItem(
      vscode3.StatusBarAlignment.Right,
      100
    );
    this.item.command = "agentox.switchAgent";
    this.item.text = "$(robot) AgentOX: starting...";
    this.item.tooltip = "Click to switch AI agent";
    this.item.show();
  }
  update(agent, drift) {
    const driftIcon = drift > 0.4 ? "\u26A0" : "\u25CF";
    this.item.text = `$(robot) ${agent} ${driftIcon}`;
    this.item.backgroundColor = drift > 0.4 ? new vscode3.ThemeColor("statusBarItem.warningBackground") : void 0;
  }
  setWatching(active) {
    if (active) {
      this.item.text = `$(eye) AgentOX: watching`;
    } else {
      this.item.text = `$(robot) AgentOX: idle`;
    }
  }
};

// src/extension.ts
var watcher = null;
var statusBar = null;
var provider = null;
function activate(ctx) {
  const ws = vscode4.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!ws)
    return;
  const agentosDir = path3.join(ws, "agentos");
  if (!fs3.existsSync(agentosDir)) {
    try {
      const { execSync } = require("child_process");
      execSync("agentox init", { cwd: ws, stdio: "ignore" });
      vscode4.window.showInformationMessage("AgentOX initialized in the background.");
    } catch (e) {
    }
  }
  provider = new AgentOXProvider(ws, ctx);
  ctx.subscriptions.push(
    vscode4.window.registerTreeDataProvider("agentoxPanel", provider)
  );
  statusBar = new AgentOXStatusBar();
  ctx.subscriptions.push(statusBar.item);
  const config = vscode4.workspace.getConfiguration("agentox");
  if (config.get("autoWatch")) {
    watcher = new AgentOXWatcher(ws, provider, statusBar);
    watcher.start();
  }
  ctx.subscriptions.push(
    vscode4.commands.registerCommand("agentox.switchAgent", () => switchAgent(ws)),
    vscode4.commands.registerCommand("agentox.setObjective", () => setObjective(ws)),
    vscode4.commands.registerCommand("agentox.addTask", () => addTask(ws)),
    vscode4.commands.registerCommand("agentox.completeTask", (item) => completeTask(ws, item)),
    vscode4.commands.registerCommand("agentox.viewStatus", () => viewStatus(ws)),
    vscode4.commands.registerCommand("agentox.openDashboard", () => openDashboard(ctx)),
    vscode4.commands.registerCommand("agentox.initProject", () => {
      try {
        const { execSync } = require("child_process");
        execSync("agentox init", { cwd: ws });
        vscode4.window.showInformationMessage("\u2713 AgentOX successfully initialized!");
        provider?.refresh();
      } catch (e) {
        vscode4.window.showErrorMessage('Failed to initialize. Try running "agentox init" in terminal or install globally: npm install -g .');
      }
    }),
    vscode4.commands.registerCommand("agentox.copyContext", async () => {
      try {
        const { execSync } = require("child_process");
        const result = execSync(
          "agentox switch none",
          { cwd: ws, encoding: "utf8" }
        );
        await vscode4.env.clipboard.writeText(result);
        const doc = await vscode4.workspace.openTextDocument({
          content: result,
          language: "markdown"
        });
        await vscode4.window.showTextDocument(
          doc,
          vscode4.ViewColumn.Beside
        );
        vscode4.window.showInformationMessage(
          "\u2713 Context copied! Paste into any AI to continue."
        );
      } catch (e) {
        vscode4.window.showErrorMessage("Failed: " + e);
      }
    })
  );
  vscode4.workspace.onDidSaveTextDocument((doc) => {
    if (watcher)
      watcher.onFileSaved(doc.uri.fsPath);
  });
  ctx.subscriptions.push(
    vscode4.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("agentox.autoWatch")) {
        const isAuto = vscode4.workspace.getConfiguration("agentox").get("autoWatch");
        if (isAuto && !watcher) {
          watcher = new AgentOXWatcher(ws, provider, statusBar);
          watcher.start();
        } else if (!isAuto && watcher) {
          watcher.stop();
          watcher = null;
        }
      }
    })
  );
}
async function switchAgent(ws) {
  const agents = [
    "claude",
    "cursor",
    "windsurf",
    "antigravity",
    "opencode",
    "aider",
    "copilot",
    "gemini",
    "none"
  ];
  const picked = await vscode4.window.showQuickPick(agents, {
    placeHolder: "Switch to which agent?"
  });
  if (!picked)
    return;
  const { execSync } = require("child_process");
  try {
    const result = execSync(
      `agentox switch ${picked}`,
      { cwd: ws, encoding: "utf8" }
    );
    const doc = await vscode4.workspace.openTextDocument({
      content: result,
      language: "markdown"
    });
    await vscode4.window.showTextDocument(doc);
    vscode4.window.showInformationMessage(
      `\u2713 Context copied! Paste in ${picked} to continue.`
    );
    provider?.refresh();
    statusBar?.update(picked, 0);
  } catch (e) {
    vscode4.window.showErrorMessage("AgentOX switch failed: " + e);
  }
}
async function setObjective(ws) {
  const obj = await vscode4.window.showInputBox({
    prompt: "What is your project objective?",
    placeHolder: "e.g. Building a todo app with React"
  });
  if (!obj)
    return;
  const { execSync } = require("child_process");
  execSync(`agentox objective "${obj}"`, { cwd: ws });
  provider?.refresh();
  vscode4.window.showInformationMessage(`\u2713 Objective set: "${obj}"`);
}
async function addTask(ws) {
  const task = await vscode4.window.showInputBox({
    prompt: "Add a task",
    placeHolder: "e.g. Create login component"
  });
  if (!task)
    return;
  const { execSync } = require("child_process");
  execSync(`agentox task add "${task}"`, { cwd: ws });
  provider?.refresh();
  vscode4.window.showInformationMessage(`\u2713 Task added: "${task}"`);
}
async function completeTask(ws, item) {
  const { execSync } = require("child_process");
  if (item && item.label) {
    const match = item.label.match(/^(\d+)\./);
    if (match) {
      const idx = match[1];
      execSync(`agentox task done ${idx}`, { cwd: ws });
      provider?.refresh();
      vscode4.window.showInformationMessage(`\u2713 Task ${idx} completed!`);
      return;
    }
  }
  const taskStr = await vscode4.window.showInputBox({
    prompt: "Enter task number (e.g., 1) or text to complete",
    placeHolder: "1"
  });
  if (!taskStr)
    return;
  execSync(`agentox task done "${taskStr}"`, { cwd: ws });
  provider?.refresh();
  vscode4.window.showInformationMessage(`\u2713 Task completed!`);
}
function viewStatus(ws) {
  const { execSync } = require("child_process");
  const out = execSync("agentox status", { cwd: ws, encoding: "utf8" });
  vscode4.window.showInformationMessage(out.slice(0, 200));
}
function openDashboard(ctx) {
  vscode4.env.openExternal(vscode4.Uri.parse("https://agentox.dev"));
}
function deactivate() {
  watcher?.stop();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
