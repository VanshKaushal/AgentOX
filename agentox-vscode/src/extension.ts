import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { AgentOXProvider } from './provider';
import { AgentOXWatcher } from './watcher';
import { AgentOXStatusBar } from './statusbar';

let watcher: AgentOXWatcher | null = null;
let statusBar: AgentOXStatusBar | null = null;
let provider: AgentOXProvider | null = null;

export function activate(ctx: vscode.ExtensionContext) {
  const ws = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!ws) return;

  // Auto-initialize if not present (Zero Manual Intervention)
  const agentosDir = path.join(ws, 'agentos');
  if (!fs.existsSync(agentosDir)) {
    try {
      const { execSync } = require('child_process');
      execSync('agentox init', { cwd: ws, stdio: 'ignore' });
      vscode.window.showInformationMessage('AgentOX initialized in the background.');
    } catch(e) {
      // Ignore if agentox CLI isn't installed in PATH yet
    }
  }

  // Init provider (sidebar)
  provider = new AgentOXProvider(ws, ctx);
  ctx.subscriptions.push(
    vscode.window.registerTreeDataProvider('agentoxPanel', provider)
  );

  // Init status bar
  statusBar = new AgentOXStatusBar();
  ctx.subscriptions.push(statusBar.item);

  // Auto-start watcher if setting enabled
  const config = vscode.workspace.getConfiguration('agentox');
  if (config.get('autoWatch')) {
    watcher = new AgentOXWatcher(ws, provider, statusBar);
    watcher.start();
  }

  // Register commands
  ctx.subscriptions.push(
    vscode.commands.registerCommand('agentox.switchAgent', () => switchAgent(ws)),
    vscode.commands.registerCommand('agentox.setObjective', () => setObjective(ws)),
    vscode.commands.registerCommand('agentox.addTask', () => addTask(ws)),
    vscode.commands.registerCommand('agentox.viewStatus', () => viewStatus(ws)),
    vscode.commands.registerCommand('agentox.openDashboard', () => openDashboard(ctx)),
    vscode.commands.registerCommand('agentox.initProject', () => {
      try {
        const { execSync } = require('child_process');
        execSync('agentox init', { cwd: ws });
        vscode.window.showInformationMessage('✓ AgentOX successfully initialized!');
        provider?.refresh();
      } catch(e) {
        vscode.window.showErrorMessage('Failed to initialize. Try running "agentox init" in terminal or install globally: npm install -g .');
      }
    }),
    vscode.commands.registerCommand('agentox.copyContext', async () => {
      try {
        const { execSync } = require('child_process');
        // Generate bootstrap prompt
        const result = execSync('agentox switch none', 
          {cwd: ws, encoding:'utf8'});
        
        // Also copy to clipboard via extension API
        await vscode.env.clipboard.writeText(result);
        
        // Show in new editor tab for visibility
        const doc = await vscode.workspace.openTextDocument({
          content: result,
          language: 'markdown'
        });
        await vscode.window.showTextDocument(doc, 
          vscode.ViewColumn.Beside);
        
        vscode.window.showInformationMessage(
          '✓ Context copied! Paste into any AI to continue.'
        );
      } catch(e) {
        vscode.window.showErrorMessage('Failed: ' + e);
      }
    })
  );

  // Watch for workspace state changes
  vscode.workspace.onDidSaveTextDocument(doc => {
    if (watcher) watcher.onFileSaved(doc.uri.fsPath);
  });

  // Listen for setting changes so it works without reloading
  ctx.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('agentox.autoWatch')) {
        const isAuto = vscode.workspace.getConfiguration('agentox').get('autoWatch');
        if (isAuto && !watcher) {
          watcher = new AgentOXWatcher(ws, provider as AgentOXProvider, statusBar as AgentOXStatusBar);
          watcher.start();
        } else if (!isAuto && watcher) {
          watcher.stop();
          watcher = null;
        }
      }
    })
  );
}

async function switchAgent(ws: string) {
  const agents = ['claude','cursor','windsurf','antigravity',
    'opencode','aider','copilot','gemini','none'];
  const picked = await vscode.window.showQuickPick(agents, {
    placeHolder: 'Switch to which agent?'
  });
  if (!picked) return;
  
  const { execSync } = require('child_process');
  try {
    const result = execSync(`agentox switch ${picked}`, 
      {cwd:ws, encoding:'utf8'});
    
    // Show prompt in new editor tab
    const doc = await vscode.workspace.openTextDocument({
      content: result, language: 'markdown'
    });
    await vscode.window.showTextDocument(doc);
    
    vscode.window.showInformationMessage(
      `✓ Context copied! Paste in ${picked} to continue.`
    );
    provider?.refresh();
    statusBar?.update(picked, 0);
  } catch(e) {
    vscode.window.showErrorMessage('AgentOX switch failed: ' + e);
  }
}

async function setObjective(ws: string) {
  const obj = await vscode.window.showInputBox({
    prompt: 'What is your project objective?',
    placeHolder: 'e.g. Building a todo app with React'
  });
  if (!obj) return;
  const { execSync } = require('child_process');
  execSync(`agentox objective "${obj}"`, {cwd:ws});
  provider?.refresh();
  vscode.window.showInformationMessage(`✓ Objective set: "${obj}"`);
}

async function addTask(ws: string) {
  const task = await vscode.window.showInputBox({
    prompt: 'Add a task',
    placeHolder: 'e.g. Create login component'
  });
  if (!task) return;
  const { execSync } = require('child_process');
  execSync(`agentox task add "${task}"`, {cwd:ws});
  provider?.refresh();
  vscode.window.showInformationMessage(`✓ Task added: "${task}"`);
}

function viewStatus(ws: string) {
  const { execSync } = require('child_process');
  const out = execSync('agentox status', {cwd:ws, encoding:'utf8'});
  vscode.window.showInformationMessage(out.slice(0,200));
}

function openDashboard(ctx: vscode.ExtensionContext) {
  // Week 7 — cloud dashboard
  vscode.env.openExternal(vscode.Uri.parse('https://agentox.dev'));
}

export function deactivate() {
  watcher?.stop();
}
