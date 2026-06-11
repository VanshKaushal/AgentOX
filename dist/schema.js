"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultState = defaultState;
exports.defaultDecisions = defaultDecisions;
exports.defaultTaskGraph = defaultTaskGraph;
exports.defaultArchMap = defaultArchMap;
function defaultState() {
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
function defaultDecisions() {
    return { decisions: [] };
}
function defaultTaskGraph() {
    return { pending: [], in_progress: [], completed: [] };
}
function defaultArchMap() {
    return {};
}
