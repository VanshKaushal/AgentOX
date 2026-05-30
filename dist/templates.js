"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrapForClaude = wrapForClaude;
exports.wrapForCursor = wrapForCursor;
exports.wrapForAider = wrapForAider;
exports.wrapForOpenCode = wrapForOpenCode;
exports.getWrapped = getWrapped;
const bootstrap_1 = require("./bootstrap");
function wrapForClaude(base) {
    return `\n${base}\n\n\nUsing the context above, continue the engineering work. Start by confirming: what is the current objective and the first pending task?`;
}
function wrapForCursor(base) {
    return `@codebase\n\n${base}\n\nContinue from task #1. Do not modify existing working files unless the task requires it.`;
}
function wrapForAider(base) {
    return `/read-only agentos/state.json agentos/decisions.json\n\n${base}\n\n/ask What is the first pending task and which files will it touch?`;
}
function wrapForOpenCode(base) {
    return `## Context\n\n${base}\n\n## Instruction\n\nBegin with task #1. State your plan before writing any code.`;
}
function getWrapped(targetAgent) {
    const base = (0, bootstrap_1.generateBootstrap)(targetAgent);
    switch (targetAgent) {
        case 'claude': return wrapForClaude(base);
        case 'cursor': return wrapForCursor(base);
        case 'aider': return wrapForAider(base);
        case 'opencode': return wrapForOpenCode(base);
        default: return base;
    }
}
