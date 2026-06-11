export interface AgentState {
  active_agent: string;
  session_start: string;
  objective: string;
  pending_tasks: string[];
  drift_score: number;
  fingerprint: string;
  version: string;
}

export interface ExecutionEntry {
  timestamp: string;
  agent: string;
  files_changed: string[];
  summary: string;
  commit_message?: string;
  accepted: boolean;
  session_id: string;
}

export interface Decision {
  decision: string;
  made_by: string;
  timestamp: string;
  reason: string;
  overridable: boolean;
}

export interface DecisionStore {
  decisions: Decision[];
}

export interface ArchitectureMap {
  [module: string]: Record<string, any>;
}

export interface TaskGraph {
  pending: string[];
  in_progress: string[];
  completed: string[];
}

export function defaultState(): AgentState {
  return {
    active_agent: "none",
    session_start: new Date().toISOString(),
    objective: "Not set — run: agentox objective \"your goal\"",
    pending_tasks: [],
    drift_score: 0,
    fingerprint: "",
    version: "0.1.0"
  };
}

export function defaultDecisions(): DecisionStore {
  return { decisions: [] };
}

export function defaultTaskGraph(): TaskGraph {
  return { pending: [], in_progress: [], completed: [] };
}

export function defaultArchMap(): ArchitectureMap {
  return {};
}
