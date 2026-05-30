import { generateBootstrap } from './bootstrap';

export function wrapForClaude(base: string): string {
  return `\n${base}\n\n\nUsing the context above, continue the engineering work. Start by confirming: what is the current objective and the first pending task?`;
}

export function wrapForCursor(base: string): string {
  return `@codebase\n\n${base}\n\nContinue from task #1. Do not modify existing working files unless the task requires it.`;
}

export function wrapForAider(base: string): string {
  return `/read-only agentos/state.json agentos/decisions.json\n\n${base}\n\n/ask What is the first pending task and which files will it touch?`;
}

export function wrapForOpenCode(base: string): string {
  return `## Context\n\n${base}\n\n## Instruction\n\nBegin with task #1. State your plan before writing any code.`;
}

export function getWrapped(targetAgent: string): string {
  const base = generateBootstrap(targetAgent);
  switch (targetAgent) {
    case 'claude': return wrapForClaude(base);
    case 'cursor': return wrapForCursor(base);
    case 'aider': return wrapForAider(base);
    case 'opencode': return wrapForOpenCode(base);
    default: return base;
  }
}
