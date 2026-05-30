import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

function runAgentosCommand(command: string, context: vscode.ExtensionContext) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('AgentOS requires an open workspace.');
        return;
    }
    
    const cwd = workspaceFolders[0].uri.fsPath;
    
    cp.exec(`npx agentos ${command}`, { cwd }, (error, stdout, stderr) => {
        if (error) {
            vscode.window.showErrorMessage(`AgentOS Error: ${error.message}`);
            return;
        }
        if (stderr) {
            vscode.window.showWarningMessage(`AgentOS Warning: ${stderr}`);
        }
        vscode.window.showInformationMessage(`AgentOS: ${stdout}`);
    });
}

class AgentOSProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | void> = new vscode.EventEmitter<vscode.TreeItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | void> = this._onDidChangeTreeData.event;
    private state: any = null;
    private workspaceRoot: string | undefined;

    constructor() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders) {
            this.workspaceRoot = workspaceFolders[0].uri.fsPath;
            this.readState();
        }
    }

    refresh(): void {
        this.readState();
        this._onDidChangeTreeData.fire();
    }

    private readState() {
        if (this.workspaceRoot) {
            const statePath = path.join(this.workspaceRoot, 'agentos', 'state.json');
            if (fs.existsSync(statePath)) {
                try {
                    const content = fs.readFileSync(statePath, 'utf8');
                    this.state = JSON.parse(content);
                } catch (e) {
                    this.state = null;
                }
            } else {
                this.state = null;
            }
        }
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: vscode.TreeItem): Thenable<vscode.TreeItem[]> {
        if (!this.state) {
            return Promise.resolve([new vscode.TreeItem("No AgentOS state found", vscode.TreeItemCollapsibleState.None)]);
        }

        if (element) {
            // It must be the pending tasks node
            if (element.label === "Pending Tasks" && this.state.pending_tasks) {
                const taskItems = this.state.pending_tasks.map((t: any) => new vscode.TreeItem(String(t.description || t.title || t), vscode.TreeItemCollapsibleState.None));
                return Promise.resolve(taskItems);
            }
            return Promise.resolve([]);
        } else {
            // Root items
            const activeAgentItem = new vscode.TreeItem(`Active Agent: ${this.state.active_agent || 'Unknown'}`, vscode.TreeItemCollapsibleState.None);
            activeAgentItem.contextValue = 'activeAgent';

            const objectiveItem = new vscode.TreeItem(`Objective: ${this.state.objective || 'None'}`, vscode.TreeItemCollapsibleState.None);
            
            const pendingTasksItem = new vscode.TreeItem("Pending Tasks", vscode.TreeItemCollapsibleState.Collapsed);
            
            const driftScoreItem = new vscode.TreeItem(`Drift Score: ${this.state.drift_score ?? 0}`, vscode.TreeItemCollapsibleState.None);
            
            const lastSnapshotItem = new vscode.TreeItem(`Last Snapshot: ${this.state.last_snapshot || 'None'}`, vscode.TreeItemCollapsibleState.None);

            return Promise.resolve([activeAgentItem, objectiveItem, pendingTasksItem, driftScoreItem, lastSnapshotItem]);
        }
    }

    public getState() {
        return this.state;
    }
}

export function activate(context: vscode.ExtensionContext) {
    console.log('AgentOS extension is now active!');

    const agentOSProvider = new AgentOSProvider();
    vscode.window.registerTreeDataProvider('agentosView', agentOSProvider);

    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'agentos.status';
    context.subscriptions.push(statusBarItem);

    let lastReportedDrift = -1;

    const updateStatusBar = () => {
        const state = agentOSProvider.getState();
        if (state) {
            const agent = state.active_agent || 'none';
            const drift = state.drift_score ?? 0;
            statusBarItem.text = `$(robot) ${agent} | drift: ${drift}`;
            statusBarItem.show();

            if (drift > 0.4 && drift !== lastReportedDrift) {
                lastReportedDrift = drift;
                vscode.window.showWarningMessage(`AgentOS: High drift detected (${drift})`, 'View Report');
            }
        } else {
            statusBarItem.hide();
        }
    };

    updateStatusBar();

    const watcher = vscode.workspace.createFileSystemWatcher('**/agentos/state.json');
    watcher.onDidChange(() => {
        agentOSProvider.refresh();
        updateStatusBar();
    });
    watcher.onDidCreate(() => {
        agentOSProvider.refresh();
        updateStatusBar();
    });
    watcher.onDidDelete(() => {
        agentOSProvider.refresh();
        updateStatusBar();
    });
    context.subscriptions.push(watcher);

    let switchCmd = vscode.commands.registerCommand('agentos.switch', async () => {
        const agent = await vscode.window.showQuickPick(['claude', 'cursor', 'aider', 'opencode']);
        if (agent) {
            runAgentosCommand(`switch ${agent}`, context);
        }
    });

    let snapshotCmd = vscode.commands.registerCommand('agentos.snapshot', () => {
        runAgentosCommand('snapshot', context);
    });

    let statusCmd = vscode.commands.registerCommand('agentos.status', () => {
        runAgentosCommand('status', context);
    });

    let checkpointCmd = vscode.commands.registerCommand('agentos.checkpoint', () => {
        runAgentosCommand('checkpoint', context);
    });

    let historyCmd = vscode.commands.registerCommand('agentos.history', () => {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('AgentOS requires an open workspace.');
            return;
        }
        
        const cwd = workspaceFolders[0].uri.fsPath;
        const snapshotsDir = path.join(cwd, 'agentos', 'snapshots');
        
        if (!fs.existsSync(snapshotsDir)) {
            vscode.window.showInformationMessage('No snapshots found.');
            return;
        }

        const files = fs.readdirSync(snapshotsDir).filter(f => f.endsWith('.json'));
        
        const snapshots = files.map(file => {
            const filePath = path.join(snapshotsDir, file);
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                const data = JSON.parse(content);
                return {
                    file,
                    filePath,
                    timestamp: data.session_start || data.timestamp || file.replace('.json', ''),
                    agent: data.active_agent || 'Unknown',
                    pendingTasks: Array.isArray(data.pending_tasks) ? data.pending_tasks.length : 0,
                    fingerprint: (data.fingerprint || '').substring(0, 8)
                };
            } catch (e) {
                return null;
            }
        }).filter(s => s !== null);

        snapshots.sort((a, b) => b!.file.localeCompare(a!.file));

        const panel = vscode.window.createWebviewPanel(
            'agentosHistory',
            'AgentOS Timeline',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.file(cwd)]
            }
        );

        let rowsHtml = snapshots.map((s: any) => `
            <tr>
                <td>${s.timestamp}</td>
                <td>${s.agent}</td>
                <td>${s.pendingTasks}</td>
                <td>${s.fingerprint}</td>
                <td>
                    <button onclick="rollback('${s.file}')">Rollback</button>
                    <button onclick="view('${s.filePath.replace(/\\/g, '\\\\')}')">View</button>
                </td>
            </tr>
        `).join('');

        panel.webview.html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>AgentOS Timeline</title>
                <style>
                    body { font-family: monospace; padding: 20px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid var(--vscode-editorGroup-border); padding: 8px; text-align: left; }
                    th { background: var(--vscode-editor-inactiveSelectionBackground); }
                    button { background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; padding: 4px 8px; cursor: pointer; margin-right: 4px; }
                    button:hover { background: var(--vscode-button-hoverBackground); }
                </style>
            </head>
            <body>
                <h2>Snapshot Timeline</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Agent</th>
                            <th>Tasks</th>
                            <th>Fingerprint</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
                <script>
                    const vscode = acquireVsCodeApi();
                    function rollback(file) {
                        vscode.postMessage({ command: 'rollback', file: file });
                    }
                    function view(filePath) {
                        vscode.postMessage({ command: 'view', filePath: filePath });
                    }
                </script>
            </body>
            </html>
        `;

        panel.webview.onDidReceiveMessage(
            async message => {
                switch (message.command) {
                    case 'rollback':
                        const selection = await vscode.window.showWarningMessage(`Are you sure you want to rollback to ${message.file}?`, 'Yes', 'Cancel');
                        if (selection === 'Yes') {
                            runAgentosCommand(`rollback ${message.file}`, context);
                        }
                        return;
                    case 'view':
                        const uri = vscode.Uri.file(message.filePath);
                        const doc = await vscode.workspace.openTextDocument(uri);
                        await vscode.window.showTextDocument(doc);
                        return;
                }
            },
            undefined,
            context.subscriptions
        );
    });

    context.subscriptions.push(switchCmd, snapshotCmd, statusCmd, checkpointCmd, historyCmd);
}

export function deactivate() {}
