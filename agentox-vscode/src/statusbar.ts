import * as vscode from 'vscode';

export class AgentOXStatusBar {
  item: vscode.StatusBarItem;
  
  constructor() {
    this.item = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right, 100
    );
    this.item.command = 'agentox.switchAgent';
    this.item.text = '$(robot) AgentOX: starting...';
    this.item.tooltip = 'Click to switch AI agent';
    this.item.show();
  }

  update(agent: string, drift: number) {
    const driftIcon = drift > 0.4 ? '⚠' : '●';
    this.item.text = `$(robot) ${agent} ${driftIcon}`;
    this.item.backgroundColor = drift > 0.4 
      ? new vscode.ThemeColor('statusBarItem.warningBackground')
      : undefined;
  }

  setWatching(active: boolean) {
    if (active) {
      this.item.text = `$(eye) AgentOX: watching`;
    } else {
      this.item.text = `$(robot) AgentOX: idle`;
    }
  }
}
