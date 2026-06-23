import { ExecutionEntry } from './schema';

export interface CompressedHistory {
  sessions: CompressedSession[];
  total_commits: number;
  files_touched: string[];
}

export interface CompressedSession {
  agent: string;
  period: string;
  what_was_done: string[];
  key_files: string[];
  entry_count: number;
}

export function compressHistory(entries: ExecutionEntry[]): CompressedHistory {
  if (entries.length === 0) {
    return { sessions: [], total_commits: 0, files_touched: [] };
  }

  // Group by agent + time window (30 min sessions)
  const sessions: CompressedSession[] = [];
  let currentSession: CompressedSession | null = null;
  let sessionStart = new Date(entries[0].timestamp).getTime();

  for (const entry of entries) {
    const t = new Date(entry.timestamp).getTime();
    const newAgent = currentSession?.agent !== entry.agent;
    const newWindow = (t - sessionStart) > 30 * 60 * 1000; // 30 min

    if (!currentSession || newAgent || newWindow) {
      if (currentSession) sessions.push(currentSession);
      sessionStart = t;
      currentSession = {
        agent: entry.agent,
        period: new Date(entry.timestamp).toLocaleDateString(),
        what_was_done: [],
        key_files: [],
        entry_count: 0
      };
    }

    // Add unique summaries
    if (entry.commit_message && 
        !currentSession.what_was_done.includes(entry.commit_message)) {
      currentSession.what_was_done.push(entry.commit_message);
    }

    // Add unique key files (non-agentos files)
    entry.files_changed
      .filter(f => !f.startsWith('agentos/') && !f.includes('node_modules'))
      .forEach(f => {
        if (!currentSession!.key_files.includes(f) && 
            currentSession!.key_files.length < 25) { // Increased to 25
          currentSession!.key_files.push(f);
        }
      });

    currentSession.entry_count++;
  }
  if (currentSession) sessions.push(currentSession);

  // All unique files ever touched
  const allFiles = [...new Set(
    entries.flatMap(e => e.files_changed)
      .filter(f => !f.startsWith('agentos/'))
  )].slice(0, 20);

  return {
    sessions: sessions.slice(-5), // last 5 sessions max
    total_commits: entries.length,
    files_touched: allFiles
  };
}

export function formatCompressed(history: CompressedHistory): string {
  if (history.sessions.length === 0) return '  (no history yet)';
  
  return history.sessions.map(s => {
    const done = s.what_was_done.slice(0,3).join('; ') || 
      `${s.entry_count} changes`;
    const files = s.key_files.slice(0,25).join(', '); // Increased to 25
    const hasMore = s.key_files.length > 25 ? ', ...' : '';
    return `  [${s.agent}] ${s.period} — ${done}\n    Files: ${files}${hasMore}`;
  }).join('\n');
}
