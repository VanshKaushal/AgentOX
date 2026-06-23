import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class AgentOXProvider implements vscode.TreeDataProvider<AgentItem> {
  private _onDidChange = new vscode.EventEmitter<AgentItem | undefined | null | void>();
  onDidChangeTreeData = this._onDidChange.event;
  private ws: string;
  private ctx: vscode.ExtensionContext;

  constructor(ws: string, ctx: vscode.ExtensionContext) {
    this.ws = ws;
    this.ctx = ctx;

    const stateFile = path.join(ws, 'agentos', 'state.json');
    const taskFile = path.join(ws, 'agentos', 'task_graph.json');

    [stateFile, taskFile].forEach(f => {
      if (fs.existsSync(f)) {
        fs.watch(f, () => {
          setTimeout(() => this.refresh(), 200);
        });
      }
    });
  }

  refresh() { this._onDidChange.fire(); }

  getTreeItem(el: AgentItem) { return el; }

  getChildren(el?: AgentItem): AgentItem[] {
    if (el) return el.children || [];
    
    const aDir = path.join(this.ws, 'agentos');
    if (!fs.existsSync(aDir)) {
      return [new AgentItem('Not initialized (Click to setup)', 
        'Click to automatically initialize AgentOS', [], 'warning', vscode.TreeItemCollapsibleState.None, 'agentox.initProject')];
    }

    try {
      const state = JSON.parse(
        fs.readFileSync(path.join(aDir,'state.json'),'utf8')
      );
      const tasks = JSON.parse(
        fs.readFileSync(path.join(aDir,'task_graph.json'),'utf8')
      );

      const items: AgentItem[] = [];

      // Agent row
      items.push(new AgentItem(
        `Agent: ${state.active_agent}`,
        'Click to change active agent',
        [], 'agent', 
        vscode.TreeItemCollapsibleState.None,
        'agentox.switchAgent'
      ));

      // Objective
      if (state.objective && !state.objective.includes('Not set')) {
        items.push(new AgentItem(
          `Goal: ${state.objective.slice(0,50)}`,
          state.objective, [], 'goal'
        ));
      }

      // Tasks
      const taskItems = (tasks.pending || []).map((t: string, i: number) =>
        new AgentItem(`${i+1}. ${t}`, 'Pending task', [], 'task')
      );
      items.push(new AgentItem(
        `Tasks (${tasks.pending?.length || 0} pending)`,
        'Pending tasks', taskItems, 'tasks',
        vscode.TreeItemCollapsibleState.Expanded
      ));

      // Drift
      const drift = state.drift_score || 0;
      items.push(new AgentItem(
        `Drift: ${drift.toFixed(2)} ${drift > 0.4 ? '⚠' : '✓'}`,
        'How much agent deviated from tasks',
        [], 'drift'
      ));

      // Action buttons at top of sidebar
      items.unshift(new AgentItem(
        'Switch Agent',
        'Generate handoff prompt and copy to clipboard',
        [], 'action', vscode.TreeItemCollapsibleState.None,
        'agentox.switchAgent'
      ));
      items.unshift(new AgentItem(
        'Copy Context',
        'Copy current context to clipboard for any AI',
        [], 'action', vscode.TreeItemCollapsibleState.None,
        'agentox.copyContext'
      ));

      return items;
    } catch {
      return [new AgentItem('Error reading state', 
        'Try: agentox repair', [], 'error')];
    }
  }
}

class AgentItem extends vscode.TreeItem {
  children: AgentItem[];
  
  constructor(
    label: string,
    tooltip: string,
    children: AgentItem[] = [],
    type: string = 'default',
    collapsible = children.length > 0 
      ? vscode.TreeItemCollapsibleState.Collapsed 
      : vscode.TreeItemCollapsibleState.None,
    commandId?: string
  ) {
    super(label, collapsible);
    this.tooltip = tooltip;
    this.children = children;
    const icons: Record<string, string> = {
      agent:'$(robot)', goal:'$(target)', 
      task:'$(circle-outline)', tasks:'$(checklist)',
      drift:'$(pulse)', warning:'$(warning)',
      error:'$(error)', action:'$(zap)'
    };
    this.description = '';
    this.iconPath = new vscode.ThemeIcon(
      (icons[type]||'$(dot)').replace('$(','').replace(')','')
    );
    if (commandId) {
      this.command = { 
        command: commandId, 
        title: label,
        arguments: [] 
      };
    }
  }
}
