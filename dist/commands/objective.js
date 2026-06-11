"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.objectiveCmd = objectiveCmd;
const commander_1 = require("commander");
const store_1 = require("../store");
function objectiveCmd() {
    return new commander_1.Command('objective')
        .description('Set or update project objective')
        .argument('<text>', 'Objective description')
        .action((text) => {
        const state = store_1.store.readState();
        state.objective = text;
        store_1.store.writeState(state);
        console.log(`✓ Objective set: "${text}"`);
    });
}
