import fs from 'fs';
import path from 'path';
import { AgentState, ExecutionEntry, DecisionStore, ArchitectureMap, TaskGraph } from './schema';

function findRoot(): string {
  let current = process.cwd();
  while (current !== path.dirname(current)) {
    if (fs.existsSync(path.join(current, 'agentos', 'state.json'))) return path.join(current, 'agentos');
    current = path.dirname(current);
  }
  return path.join(process.cwd(), 'agentos');
}

const ROOT = () => findRoot();
const p = (file: string) => path.join(ROOT(), file);

export const store = {
  getRootDir(): string { return path.dirname(ROOT()); },
  exists(): boolean { return fs.existsSync(ROOT()); },

  readState(): AgentState { return JSON.parse(fs.readFileSync(p('state.json'), 'utf8')); },
  writeState(s: AgentState): void { fs.writeFileSync(p('state.json'), JSON.stringify(s, null, 2)); },

  readDecisions(): DecisionStore { return JSON.parse(fs.readFileSync(p('decisions.json'), 'utf8')); },
  writeDecisions(d: DecisionStore): void { fs.writeFileSync(p('decisions.json'), JSON.stringify(d, null, 2)); },

  readArchMap(): ArchitectureMap { return JSON.parse(fs.readFileSync(p('architecture_map.json'), 'utf8')); },
  writeArchMap(a: ArchitectureMap): void { fs.writeFileSync(p('architecture_map.json'), JSON.stringify(a, null, 2)); },

  readTaskGraph(): TaskGraph { return JSON.parse(fs.readFileSync(p('task_graph.json'), 'utf8')); },
  writeTaskGraph(t: TaskGraph): void { fs.writeFileSync(p('task_graph.json'), JSON.stringify(t, null, 2)); },

  appendLog(entry: ExecutionEntry): void {
    fs.appendFileSync(p('execution_log.jsonl'), JSON.stringify(entry) + '\n');
  },

  readLog(last = 10): ExecutionEntry[] {
    if (!fs.existsSync(p('execution_log.jsonl'))) return [];
    const lines = fs.readFileSync(p('execution_log.jsonl'), 'utf8').trim().split('\n').filter(Boolean);
    return lines.slice(-last).map(l => JSON.parse(l));
  },

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
  }
};
