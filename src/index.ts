#!/usr/bin/env node
import { Command } from 'commander';
import { initCmd } from './commands/init';
import { logCommitCmd, logPublicCmd } from './commands/log-commit';
import { useCmd } from './commands/use';
import { statusCmd } from './commands/status';
import { taskCmd } from './commands/task';
import { decisionCmd } from './commands/decision';
import { snapshotCmd } from './commands/snapshot';
import { switchCmd } from './commands/switch';
import { rollbackCmd } from './commands/rollback';
import { reportCmd } from './commands/report';
import { checkpointCmd } from './commands/checkpoint';
import { serveCmd } from './commands/serve';
import { objectiveCmd } from './commands/objective';
// more imports added by later prompts

const program = new Command();
program.name('agentox').description('Cross-agent continuity layer').version('0.1.1');
program.addCommand(initCmd());
program.addCommand(logCommitCmd());
program.addCommand(logPublicCmd());
program.addCommand(useCmd());
program.addCommand(statusCmd());
program.addCommand(taskCmd());
program.addCommand(decisionCmd());
program.addCommand(snapshotCmd());
program.addCommand(switchCmd());
program.addCommand(rollbackCmd());
program.addCommand(reportCmd());
program.addCommand(checkpointCmd());
program.addCommand(serveCmd());
program.addCommand(objectiveCmd());
import { watchCmd } from './commands/watch';
// more commands added by later prompts
program.addCommand(watchCmd());
program.parse();
