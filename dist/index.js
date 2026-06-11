#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const init_1 = require("./commands/init");
const log_commit_1 = require("./commands/log-commit");
const use_1 = require("./commands/use");
const status_1 = require("./commands/status");
const task_1 = require("./commands/task");
const decision_1 = require("./commands/decision");
const snapshot_1 = require("./commands/snapshot");
const switch_1 = require("./commands/switch");
const rollback_1 = require("./commands/rollback");
const report_1 = require("./commands/report");
const checkpoint_1 = require("./commands/checkpoint");
const serve_1 = require("./commands/serve");
const objective_1 = require("./commands/objective");
// more imports added by later prompts
const program = new commander_1.Command();
program.name('agentox').description('Cross-agent continuity layer').version('0.1.1');
program.addCommand((0, init_1.initCmd)());
program.addCommand((0, log_commit_1.logCommitCmd)());
program.addCommand((0, use_1.useCmd)());
program.addCommand((0, status_1.statusCmd)());
program.addCommand((0, task_1.taskCmd)());
program.addCommand((0, decision_1.decisionCmd)());
program.addCommand((0, snapshot_1.snapshotCmd)());
program.addCommand((0, switch_1.switchCmd)());
program.addCommand((0, rollback_1.rollbackCmd)());
program.addCommand((0, report_1.reportCmd)());
program.addCommand((0, checkpoint_1.checkpointCmd)());
program.addCommand((0, serve_1.serveCmd)());
program.addCommand((0, objective_1.objectiveCmd)());
const watch_1 = require("./commands/watch");
// more commands added by later prompts
program.addCommand((0, watch_1.watchCmd)());
program.parse();
